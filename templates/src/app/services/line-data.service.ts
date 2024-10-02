import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, shareReplay, throwError } from 'rxjs';
import { LineData } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class LineDataService {
  private http = inject(HttpClient);
  private readonly lineData = new Map<string, Observable<LineData>>();

  getLineData(line: string, directionSwapped: boolean): Observable<LineData> {
    const directionNumber: string = directionSwapped ? "1" : "0";
    const url = `/api/v1/lines/${line}/poles/?direction=${directionNumber}`;
    const key = this.constructKey(line, directionSwapped);
    if (!this.lineData.has(key)) {
      this.lineData.set(key, this.http.get<LineData>(url)
      .pipe(
        shareReplay(),
        catchError(this.handleError)
      ));
    }
    return this.lineData.get(key) ?? of();
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
