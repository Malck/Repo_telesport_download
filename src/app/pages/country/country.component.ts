import { Component, OnDestroy, OnInit } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Observable,Subscription} from 'rxjs';

/**
 * Country page component.
 */

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss',
})
export class CountryComponent implements OnInit, OnDestroy {

  title: string = '';
  entries: number = 0;
  totalmedals: number = 0;
  athletes: number = 0;

  lineChartData!: ChartConfiguration['data'];
  lineChartOptions!: ChartConfiguration['options'];
  lineChartType!: ChartType;

  isLoading$!: Observable<Boolean>;
  error$!: Observable<String>;
  olympicSub!: Subscription;


  constructor( private olympicService: OlympicService,
               private route: ActivatedRoute,
               private router: Router ) {}

  ngOnInit(): void {
    this.isLoading$ = this.olympicService.isLoading$;
    this.error$ = this.olympicService.error$;
    this.setChartConfig();
    const id:string = this.route.snapshot.params['id'];
    this.olympicSub = this.olympicService.getOlympicById(+id).subscribe({
      next: (data: Olympic) => {
        this.setTitle(data);
        this.setEntries(data);
        this.setTotalMedals(data);
        this.setAthletes(data);
        this.setChart(data);
      },
      error: (_msg: string) => this.router.navigateByUrl('Country is not found')
    });
  }
  ngOnDestroy(): void {
    this.olympicSub.unsubscribe();
  }

/**
   * Set the country title , his number of entries , his total of medals and the number of athletes.
   * @param {Olympic} olympic An olympic item.
*/

private setTitle(olympic: Olympic) {
  this.title = olympic.country;
}
private setEntries(olympic: Olympic) {
  this.entries = olympic.participations.length;
}
private setTotalMedals(olympic: Olympic) {
  this.totalmedals = 0
  olympic.participations.forEach(participation => this.totalmedals += participation.medalsCount);
}
private setAthletes(olympic: Olympic) {
  olympic.participations.forEach(participation => this.athletes += participation.athleteCount);
}

  /**
   * Set the chart data.
   * @param {Olympic} olympic An olympic item.
   */

  private setChart(olympic: Olympic): void {
    let labels: number[] = [];
    let data: number[] = [];
    let participations = olympic.participations;

    participations.forEach(participation => {
      data.push(participation.medalsCount);
      labels.push(participation.year)
    });

    this.lineChartData = {
      datasets: [
        {
          data: data,
          backgroundColor: 'rgba(0,0,0,0)',
          fill: 'origin',
        }
      ],
      labels: labels,
    };
  }

  /**
   * Set the chart options and type.
   */

  private setChartConfig(): void {
    this.setChartOptions();
    this.setChartType();
  }
  
  /**
   * Set the chart options.
   */

  private setChartOptions() {
    this.lineChartOptions = {
      elements: {
        line: {
          tension: 0,
        },
      },
      scales: {
        y: {
          position: 'left',
          suggestedMin: 0
        },
        x: {
          title: {
            display: true,
            text: 'Dates',
            font: {
              size: 20
            }
          }
        }
      },
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          enabled: false
        }
      },
    };
  }
  
  /**
   * Set the chart type.
   */

  private setChartType() {
    this.lineChartType = 'line';
  }

}