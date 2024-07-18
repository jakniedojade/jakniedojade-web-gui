import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LinesService {

  constructor(private http: HttpClient) { }

  getLines() {
    return this.http.get<any>('http://localhost:3000/fake-api');
  }
}
