import { Injectable } from '@angular/core';
import { Stops } from '../interfaces/stops';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines!: string[];
  private stops = new Map<string, Stops>();

  setCacheStops(line: string, stops: Stops): void {
    if (!this.stops.has(line)) {
      const key = this.constructKey(line, stops.direction);
      this.stops.set(key, stops);
    }
  }

  getCacheStops(line: string, direction: boolean): Stops | undefined {
    const key = this.constructKey(line, direction)
    const data = this.stops.get(key);
    return data;
  }

  private constructKey(line: string, direction: boolean): string {
    return `${line}-${direction}`; 
  }

  setCacheLines(lines: string[]): void {
    this.lines = lines;
  }

  getCacheLines() {
    return this.lines;
  }

}