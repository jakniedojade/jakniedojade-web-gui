import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, shareReplay, throwError } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  private http = inject(HttpClient);
  private readonly stopsData = new Map<string, Observable<Stops>>();

  getStops(line: string, directionSwapped: boolean): Observable<Stops> {
    const directionNumber: string = directionSwapped ? "1" : "0";
    const url = `/api/v1/lines/${line}/stops/?direction=${directionNumber}`;
    const key = this.constructKey(line, directionSwapped);
    if (!this.stopsData.has(key)) {
      this.stopsData.set(key, this.http.get<Stops>(url)
      .pipe(
        shareReplay(),
        catchError(this.handleError)
      ));
    }
    return this.stopsData.get(key) ?? of();
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

  private constructKey(line: string, directionSwapped: boolean): string {
    return `${line}-${directionSwapped}`; 
  }
}
