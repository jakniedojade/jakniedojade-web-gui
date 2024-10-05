import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { PolesDetails } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class PolesOnStopService {
  private http = inject(HttpClient);
  private readonly polesData: { [key: number]: Observable<PolesDetails[]> } = {}; 

  getPolesOnStop(stopId: number): Observable<PolesDetails[]> {
    if (!this.polesData[stopId]) {
      this.polesData[stopId] = this.http.get<PolesDetails[]>(`/api/v1/stops/${stopId}/poles/`)
        .pipe(
          shareReplay(),
          catchError(this.handleError)
        );
    }
    return this.polesData[stopId];
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client-side or network error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}`);
    }
    return throwError(() => new Error('An error occurred while fetching poles'));
  }
}

