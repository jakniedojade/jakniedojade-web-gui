import { Injectable } from '@angular/core';
import { StopsInfo } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines!: string[];
  private stops = new Map<string, StopsInfo[]>();

  setCacheStops(line: string, stops: StopsInfo[]): void {
    if (!this.stops.has(line)) {
      this.stops.set(line, stops);
    }
  }

  getCacheStops(key: string): StopsInfo[] | undefined {
    const data = this.stops.get(key);
    return data;
  }

  setCacheLines(lines: string[]): void {
    this.lines = lines;
  }

  getCacheLines() {
    return this.lines;
  }

}