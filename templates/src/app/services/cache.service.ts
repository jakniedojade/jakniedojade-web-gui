import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private lines!: string[];

  set(lines: string[]): void {
    this.lines = lines;
  }

  get() {
    return this.lines;
  }

}