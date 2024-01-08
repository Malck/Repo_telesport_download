import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, finalize, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Olympic } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private _olympics = new BehaviorSubject<Olympic[]>([]);
  private _loading = new BehaviorSubject<Boolean>(false);
  private _error = new BehaviorSubject<String>('');

  isLoading$ = this._loading.asObservable();
  error$ = this._error.asObservable();

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<Olympic[]> {
    this._loading.next(true);
    return this.http.get<Olympic[]>(this.olympicUrl).pipe(
      tap((value) => {
        if (Array.isArray(value) && value.length > 0) {
          this._error.next('');
          this._olympics.next(value);
        } else {
          this._error.next('No data found');
        }
      }),
      catchError((error, caught) => {
        this._error.next('An error occured retrieving data');
        throw caught;
      }),
      finalize(() => this._loading.next(false))
    );
  }

  getOlympics(): Observable<Olympic[]> {
    return this._olympics
      .asObservable()
      .pipe(filter((value) => Array.isArray(value) && value.length > 0));
  }

  getOlympicById(id: number): Observable<Olympic> {
    return this._olympics.asObservable().pipe(
      filter((value) => Array.isArray(value) && value.length > 0),
      map((olympics) => {
        let filtered = olympics.filter((olympic) => olympic.id == id);
        if (filtered.length == 0) {
          throw new Error('Country is not found');
        }
        return filtered[0];
      })
    );
  }
}
