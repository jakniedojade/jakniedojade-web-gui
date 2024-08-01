import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  private http = inject(HttpClient);

  fetchStops(line: string, direction: boolean): Observable<Stops> {
    const directionNumber: string = direction ? "1" : "0";
    return this.http.get<Stops>(`/api/v1/lines/${line}/stops/?direction=${directionNumber}`)
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
    return throwError(() => new Error(`Wystąpił błąd przy pobieraniu przystanków`));
  }
}
