import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Lines } from '../interfaces/lines';

@Injectable({
  providedIn: 'root'
})
export class LinesService {
  private http = inject(HttpClient);

  getLines() : Observable<Lines> {
    return this.http.get<Lines>('/api/v1/lines')
    .pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client side or network error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}`);
    }
    return throwError(() => new Error(`Wystąpił błąd przy pobieraniu linii`));
  }
}
