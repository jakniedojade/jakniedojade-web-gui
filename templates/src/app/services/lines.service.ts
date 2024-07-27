import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinesService {

  constructor(private http: HttpClient) { }

  fetchLines() : Observable<string[]> {
    return this.http.get<string[]>('/api/v1/lines');
  }
}
