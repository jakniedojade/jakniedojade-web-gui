import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  private http = inject(HttpClient);
  private stopsData$: Observable<Stops[]>;

  constructor() {
    this.stopsData$ = this.http.get<Stops[]>('/api/v1/stops/')
    .pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }

  getStops() : Observable<Stops[]> {
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
