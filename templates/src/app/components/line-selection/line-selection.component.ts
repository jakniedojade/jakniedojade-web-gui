import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { CacheService } from '../../services/cache.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule } from '@angular/forms';

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

  constructor(private router: Router, private linesService: LinesService, private cacheService: CacheService) {
    this.lines = [];
    this.filteredLines = [];
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    const cachedData = this.cacheService.get();
    if (!cachedData) {
      this.linesService.getLines().subscribe((data: any) => {
        try {
          this.cacheService.set(data);
          this.lines = data;
          this.filteredLines = this.lines;
        } catch (error) {
          console.error(error);
        }
      });
    } else {
      this.lines = this.cacheService.get();
      this.filteredLines = this.lines;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
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
