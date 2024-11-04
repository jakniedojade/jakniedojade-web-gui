import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { Lines } from '../interfaces/lines';

@Injectable({
  providedIn: 'root'
})
export class LinesService {
  private http = inject(HttpClient);
  private linesData$: Observable<Lines>;

  public categoryIconsMapping: any = {
    cementaryLines: 'local_florist', 
    expressLines: 'bolt', 
    fastLines: 'fast_forward', 
    fastTemporaryLines: 'directions_bus', // no one knows about them anyway
    localLines: 'location_city', 
    nightLines: 'bedtime', 
    regularLines: 'directions_bus',
    regularTemporaryLines: 'directions_bus', // no one knows about them anyway
    specialLines: 'star',
    substituteLines: 'swap_horiz', 
    zoneLines: 'map',
    zoneTemporaryLines: 'map', // no one knows about them anyway
  };
  
  constructor() {
    this.linesData$ = this.http.get<Lines>('https://jakniedojade-web-d9aeg6bfauh2hwcs.polandcentral-01.azurewebsites.net/api/v1/lines/')
    .pipe(
      shareReplay(),
      catchError(this.handleError)
    );
  }

  getLines() : Observable<Lines> {
    return this.linesData$;
  }

  getLineIcon(lineNumber: string): Observable<string> {
    return this.linesData$.pipe(
      map(lines => {
        const allLines = Object.entries(lines);
        const lineCategory = allLines.find(lines => {
          return lines[1].includes(lineNumber); 
        });
        return lineCategory ? this.categoryIconsMapping[lineCategory[0]] : 'error';
      })
    );
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
