import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { Lines } from '../interfaces/lines';

@Injectable({
  providedIn: 'root'
})
export class LinesService {
  private http = inject(HttpClient);
  private linesData$: Observable<Lines>;

  constructor() {
    this.linesData$ = this.http.get<Lines>('/api/v1/lines/')
    .pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }

  getLines() : Observable<Lines> {
    return this.linesData$;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client side or network error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}`);
    }
    return throwError(() => new Error(`An error occurred while fetching lines`));
  }
}
