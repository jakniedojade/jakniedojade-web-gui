import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { LineData } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class LineDataService {
  private http = inject(HttpClient);
  private readonly lineData = new Map<string, Observable<LineData[]>>();

  getLineData(line: string): Observable<LineData[]> {
    const url = `https://api.jakniedojade.waw.pl/v1/warsaw/lines/${line}/directions/`;

    if (!this.lineData.has(line)) {
      this.lineData.set(line, this.http.get<LineData[]>(url).pipe(
        shareReplay(),
        catchError(error => this.handleError(error))
      ));
    }

    return this.lineData.get(line) as Observable<LineData[]>;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client side or network error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}`);
    }
    return throwError(() => new Error(`An error occurred while fetching line data`));
  }
}
