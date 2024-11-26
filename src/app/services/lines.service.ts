import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { Lines } from '../interfaces/lines';

@Injectable({
  providedIn: 'root'
})
export class LinesService {
  private http = inject(HttpClient);
  private linesData$: Observable<Lines[]>;
  
  private categoryIconsMapping: { [key: string]: string } = {
    '1': 'directions_bus',
    '2': 'directions_bus',
    '3': 'directions_bus',
    '4': 'directions_bus',
    '5': 'fast_forward',
    '7': 'map',
    '8': 'map',
    '9': 'star',
    'C': 'local_florist',
    'E': 'bolt',
    'L': 'location_city',
    'N': 'bedtime',
    'Z': 'swap_horiz'
  };

  constructor() {
    this.linesData$ = this.http.get<Lines[]>('https://api.jakniedojade.waw.pl/v1/warsaw/lines/')
    .pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }
  
  getLines() : Observable<Lines[]> {
    return this.linesData$;
  }

  getLineIcon(lineNumber: string): string {
    return this.categoryIconsMapping[lineNumber.charAt(0)] || '';
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
