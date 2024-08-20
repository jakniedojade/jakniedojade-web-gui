import { Injectable } from '@angular/core';
import { Stops } from '../interfaces/stops';
import { Shapes } from '../interfaces/shapes';
import { Lines } from '../interfaces/lines';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines!: Lines;
  private stops = new Map<string, Stops>();
  private shapes = new Map<string, Shapes[]>();

  setCacheShapes(line: string, direction: boolean, shapes: Shapes[]): void {
    const key = this.constructKey(line, direction);
    this.shapes.set(key, shapes);
  }

  getCacheShapes(line: string, direction: boolean): Shapes[] | undefined {
    const key = this.constructKey(line, direction);
    return this.shapes.get(key);
  }

  setCacheStops(line: string, stops: Stops): void {
    const key = this.constructKey(line, stops.direction);
    this.stops.set(key, stops);
  }

  getCacheStops(line: string, direction: boolean): Stops | undefined {
    const key = this.constructKey(line, direction)
    return this.stops.get(key);
  }

  private constructKey(line: string, direction: boolean): string {
    return `${line}-${direction}`; 
  }

  setCacheLines(lines: Lines): void {
    this.lines = lines;
  }

  getCacheLines(): Lines {
    return this.lines;
  }

}