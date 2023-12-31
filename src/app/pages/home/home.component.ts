import { Component, OnInit, OnDestroy } from '@angular/core';
import DatalabelsPlugin, { Context } from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Observable, Subscription } from 'rxjs';
import { Olympic } from 'src/app/core/models/Olympic';
import { Participation } from 'src/app/core/models/Participation';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';

/**
 * Home page component.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})

export class HomeComponent implements OnInit, OnDestroy {
  numberOfJOs: number = 0;
  numberOfCountries: number = 0;

  pieChartData!: ChartData<'pie', number[], string | string[]>;
  pieChartOptions!: ChartConfiguration['options'];
  pieChartType!: ChartType;
  pieChartPlugins = [DatalabelsPlugin];

  isLoading$!: Observable<Boolean>;
  error$!: Observable<String>;
  olympicSub!: Subscription;

  constructor(
    private olympicService: OlympicService,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.isLoading$ = this.olympicService.isLoading$;
    this.error$ = this.olympicService.error$;
    this.setChartConfig();
    this.olympicSub = this.olympicService
      .getOlympics()
      .subscribe((data: Olympic[]) => this.fillData(data));
  }

  ngOnDestroy(): void {
    this.olympicSub.unsubscribe();
  }

  /**
   * Set the number of countries, 
   * number of participations in Olympics,
   */

  private fillData(olympics: Olympic[]): void {
    this.fillNumberOfCountries(olympics);
    this.fillNumberOfJOs(olympics);
    this.fillChart(olympics);
  }

  private fillNumberOfCountries(olympics: Olympic[]): void {
    this.numberOfCountries = olympics.length;
  }
  /* */
  private fillNumberOfJOs(olympics: Olympic[]): void {
    let numberMax = 0;
    olympics.forEach((country) => {
      let participations: Participation[] = country.participations;
      numberMax = numberMax < participations.length ? participations.length : numberMax;
    });
    this.numberOfJOs = numberMax;
  }

  /**
   * Set the chart data.
   * @param {Olympic} olympic An olympic item.
   */

  private fillChart(olympics: Olympic[]): void {
    let labels: string[] = [];
    let data: number[] = [];

    olympics.forEach((country) => {
      let participations: Participation[] = country.participations;
      let medals = 0;
      participations.forEach(
        (participation) => (medals += participation.medalsCount)
      );
      data.push(medals);
      labels.push(country.country);
    });

    this.pieChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
        },
      ],
    };
  }

  /**
   * Set the chart options and type.
   */

  private setChartConfig(): void {
    this.setChartOptions();
    this.setChartType();
  }

  private setChartOptions(): void {
    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          formatter: (_value: string, ctx: Context) => {
            if (ctx.chart.data.labels) {
              return ctx.chart.data.labels[ctx.dataIndex];
            }
            return null;
          },
        },
        tooltip: {
          displayColors: true,
        },
      },
      onClick: (_event, elements, _chart) => {
        let index = elements[0].index;
        this.router.navigateByUrl('Country/' + (index + 1));
      },
    };
  }
  
  private setChartType(): void {
    this.pieChartType = 'pie';
  }
}
