import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { Line } from '../interfaces/lines';

interface ResponseLines {
  type: string;
  lines: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LinesService {
  private http = inject(HttpClient);
  private linesData$: Observable<Line[]>;
  
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
    this.linesData$ = this.http.get<ResponseLines[]>('https://api.jakniedojade.waw.pl/v1/warsaw/lines/')
      .pipe(
        map((responseLines: ResponseLines[]) =>
          responseLines.flatMap((line: ResponseLines) => line.lines)
            .map((line: string) => ({
              number: line,
              icon: this.categoryIconsMapping[line.charAt(0)] || '',
            }))
        ),
        shareReplay(),
        catchError(this.handleError)
      );
  }

  getLineIcon(lineNumber: string): Observable<string> {
    return this.linesData$.pipe(
      map((linesArray: Line[]) =>
        linesArray.find(line => line.number.includes(lineNumber))?.icon || ''
      )
    );
  }
  
  getLines() : Observable<Line[]> {
    return this.linesData$;
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
