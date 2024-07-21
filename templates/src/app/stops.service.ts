import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Stops } from './stops';

@Injectable({
  providedIn: 'root'
})
export class StopsService {

  constructor(private http: HttpClient) { }

  getStops(line: string): Observable<Stops[]> {
    //USING ARGUMENT: return this.http.get<Stops>(`http://localhost:4000/${line}`);
    return this.http.get<Stops[]>(`http://localhost:4000/stops`);
  }
}
