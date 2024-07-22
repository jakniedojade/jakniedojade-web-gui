import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LinesService {

  constructor(private http: HttpClient) { }

  getLines() : Observable<string[]> {
    return this.http.get<string[]>('http://localhost:3000/fake-api');
  }
}
