import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  constructor(private http: HttpClient) { }

  fetchStops(line: string): Observable<Stops> {
    return this.http.get<Stops>(`/api/v1/lines/${line}/stops`);
  }
}
