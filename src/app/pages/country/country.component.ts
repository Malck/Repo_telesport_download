import { Component, OnDestroy, OnInit } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartConfiguration, ChartType } from 'chart.js';
//import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Observable } from 'rxjs';
//import { Statistic } from 'src/app/core/models/Statistic';

/**
 * Single country page component.
 */
@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrl: './country.component.scss',
})
export class CountryComponent implements OnInit {

  title: string = '';
  statistics: Statistic[] = [];
  
  lineChartData!: ChartConfiguration['data'];
  lineChartOptions!: ChartConfiguration['options'];
  lineChartType!: ChartType;

  isLoading$!: Observable<Boolean>;
  error$!: Observable<String>;

  constructor( private olympicService: OlympicService,
               private route: ActivatedRoute,
               private router: Router ) {}

  ngOnInit(): void {
    this.isLoading$ = this.olympicService.isLoading$;
    this.error$ = this.olympicService.error$;
    this.setChartConfig();
    let id = this.route.snapshot.params['id'];
    this.olympicService.getOlympicById(id).subscribe({
      next: (data: Olympic) => {
        this.setTitle(data);
        this.setStatistics(data);
        this.setChart(data);
      },
      error: (msg: any) => this.router.navigateByUrl('Country is not found')
    });
  }

  /**
   * Set the statistics component to display number of entries, number of medals 
   * and number of athletes informations.
   * @param {Olympic} olympic An olympic item.
   */
  private setStatistics(olympic: Olympic): void {
    this.setNumberOfEntries(olympic);
    this.setNumberOfMedals(olympic);
    this.setNumberOfAthletes(olympic);
  }
  
  /**
   * Set number of entries information.
   * @param {Olympic} olympic An olympic item.
   */
  private setNumberOfEntries(olympic: Olympic) {
    let title = 'Number of entries';
    let value = olympic.participations.length;
    this.statistics.push({title, value}); 
  }
  
  /**
   * Set number of medals information.
   * @param {Olympic} olympic An olympic item.
   */
  private setNumberOfMedals(olympic: Olympic) {
    let title = 'Total number of medals';
    let value = 0;
    olympic.participations.forEach(participation => value += participation.medalsCount);
    this.statistics.push({title, value}); 
  }
  
  /**
   * Set number of athletes information.
   * @param {Olympic} olympic An olympic item.
   */
  private setNumberOfAthletes(olympic: Olympic) {
    let title = 'Total number of athletes';
    let value = 0;
    olympic.participations.forEach(participation => value += participation.athleteCount);
    this.statistics.push({title, value}); 
  }
  
  /**
   * Set number the country title.
   * @param {Olympic} olympic An olympic item.
   */
  private setTitle(olympic: Olympic) {
    this.title = olympic.country;
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