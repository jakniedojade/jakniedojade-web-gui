import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { LineOnPole } from '../interfaces/line-on-pole';

@Injectable({
  providedIn: 'root'
})
export class LinesOnPoleService {
  private http = inject(HttpClient);

  getLinesOnPole(poleId: number): Observable<LineOnPole[]> {
    return this.http.get<LineOnPole[]>(`https://api.jakniedojade.waw.pl/v1/warsaw/poles/${poleId}/directions/`)
      .pipe(
        shareReplay(),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client-side or network error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}`);
    }
    return throwError(() => new Error('An error occurred while fetching lines on pole'));
  }
}
