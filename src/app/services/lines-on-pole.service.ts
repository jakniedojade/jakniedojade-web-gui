import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinesOnPoleService {
  private http = inject(HttpClient);

  getLinesOnPole(poleId: number): Observable<string[]> {
    return this.http.get<string[]>(`https://jakniedojade-web-d9aeg6bfauh2hwcs.polandcentral-01.azurewebsites.net/api/v1/poles/${poleId}/lines/`)
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
