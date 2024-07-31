import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {
  private http = inject(HttpClient);

  fetchStops(line: string, direction: boolean): Observable<Stops> {
    const directionNumber: string = direction ? "1" : "0";
    return this.http.get<Stops>(`/api/v1/lines/${line}/stops/?direction=${directionNumber}`);
  }
}
