import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines: any;

  set(lines: any): void {
    this.lines = lines;
  }

  get() {
    return this.lines;
  }

}