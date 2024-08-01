import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Shapes } from '../interfaces/shapes';

@Injectable({
  providedIn: 'root'
})
export class ShapesService {
  private http = inject(HttpClient);

  fetchShapes(line: string, direction: boolean, startStop: string, endStop: string): Observable<Shapes[]> {
    const directionNumber: string = direction ? "1" : "0";
    //TEMPORARY REQUEST WITH WHOLE RANGE ONLY
    return this.http.get<Shapes[]>(`/api/v1/lines/${line}/latency?start_stop=${startStop}&end_stop=${endStop}&whole_range=${true}&direction=${directionNumber}`);
  }
}
