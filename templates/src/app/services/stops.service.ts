import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  constructor(private http: HttpClient) { }

  fetchStops(line: string, direction: boolean): Observable<Stops> {
    const directionNumber: string = direction ? "0" : "1";
    return this.http.get<Stops>(`/api/v1/lines/${line}/stops/?direction=${directionNumber}`);
  }
}
