import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { PoleDetails } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class PolesOnStopService {
  private http = inject(HttpClient);
  private readonly polesData: { [key: number]: Observable<PoleDetails[]> } = {}; 

  getPolesOnStop(stopId: number): Observable<PoleDetails[]> {
    if (!this.polesData[stopId]) {
      this.polesData[stopId] = this.http.get<PoleDetails[]>(`/api/v1/stops/${stopId}/poles/`)
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

