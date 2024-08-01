import { Injectable } from '@angular/core';
import { Stops } from '../interfaces/stops';
import { Shapes } from '../interfaces/shapes';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines!: string[];
  private stops = new Map<string, Stops>();
  private shapes = new Map<string, Shapes[]>();

  setCacheShapes(line: string, direction: boolean, shapes: Shapes[]): void {
    if (!this.shapes.has(line)) {
      const key = this.constructKey(line, direction);
      this.shapes.set(key, shapes);
    }
  }

  getCacheShapes(line: string, direction: boolean): Shapes[] | undefined {
    const key = this.constructKey(line, direction)
    const data = this.shapes.get(key);
    return data;
  }

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