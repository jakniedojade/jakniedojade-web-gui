import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../lines.service';
import { CacheService } from '../cache.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-selection',
  standalone: true,
  imports: [MatButtonModule, CommonModule],
  templateUrl: './line-selection.component.html',
  styleUrl: './line-selection.component.scss',
  providers: []
})
export class LineSelectionComponent implements OnInit {
  lines: any;

  constructor(private router: Router, private linesService: LinesService, private cacheService: CacheService) {}

  ngOnInit(): void {
    this.getData()
  }

  getData() {
    const cachedData = this.cacheService.get()
    if (!cachedData) {
      this.linesService.getLines().subscribe(data => {
        try {
          this.cacheService.set(data);
          this.lines = data.lines;
          console.log("fetch")
        } catch (error) {
          console.error(error);
        }
      });
    } else {
      this.lines = this.cacheService.get().lines;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
