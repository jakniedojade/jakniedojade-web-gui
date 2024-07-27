import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { StopsService } from '../../services/stops.service';
import { CacheService } from '../../services/cache.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Stops, StopsInfo } from '../../interfaces/stops';

@Component({
  selector: 'app-line-selection',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './line-selection.component.html',
  styleUrl: './line-selection.component.scss',
  providers: []
})

export class LineSelectionComponent implements OnInit {
  lines: string[];
  filteredLines: string[];
  stops: StopsInfo[] = [];

  constructor(private router: Router, private linesService: LinesService, private stopsService: StopsService, private cacheService: CacheService) {
    this.lines = [];
    this.filteredLines = [];
  }

  ngOnInit(): void {
    this.getLines();
  }

  getLines() {
    const cachedLines = this.cacheService.getCacheLines();

    if (!cachedLines) {
      this.linesService.fetchLines().subscribe((data: any) => {
        this.cacheService.setCacheLines(data);
        this.lines = data;
        this.filteredLines = this.lines;
      });
    } else {
      this.lines = this.cacheService.getCacheLines();
      this.filteredLines = this.lines;
    }
  }

  getStops(line: string) {
    const cachedStops = this.cacheService.getCacheStops(line);

    if (!cachedStops) {
      this.stopsService.fetchStops(line).subscribe((data: any) => {
        this.cacheService.setCacheStops(line, data.stops);
        this.navigateTo(line);
      });
    } else {
      this.navigateTo(line);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([`analyze/${route}`]);
  }

  // Add a trackBy function to improve performance when rendering the lines
  trackByIndex(index: number, item: string) {
    return index;
  }

  // Filter lines based on input value
  applyFilter(filterValue: EventTarget) {
    this.filteredLines = this.lines.filter((line) =>
        line.toLowerCase().includes((filterValue as HTMLInputElement).value.toLowerCase())
    );
    if(this.filteredLines.length == 0)
      this.filteredLines = this.lines;
  }
}
