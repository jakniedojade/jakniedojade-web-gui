import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { Stop } from '../interfaces/stop';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  private http = inject(HttpClient);
  private stopsData$: Observable<Stop[]>;

  constructor() {
    this.stopsData$ = this.http.get<Stop[]>('https://api.jakniedojade.waw.pl/v1/warsaw/stops/')
    .pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }

  getStops() : Observable<Stop[]> {
    return this.stopsData$;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client side or network error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}`);
    }
    return throwError(() => new Error(`An error occurred while fetching stops`));
  }
}
