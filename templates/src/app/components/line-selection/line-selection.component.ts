import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { CacheService } from '../../services/cache.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { Lines } from '../../interfaces/lines';

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
  private router = inject(Router);
  private linesService = inject(LinesService);
  private cacheService = inject(CacheService);
  private errorDialogService = inject(ErrorDialogService);

  private lines = new Map<string, string[]>();
  public filteredLines = new Map<string, string[]>();

  private categoryMapping: any = {
    cementary_lines: 'Linie cmentarne',
    express_lines: 'Linie ekspresowe',
    fast_lines: 'Linie przyspieszone',
    fast_temporary_lines: 'Linie przyspieszone okresowe',
    local_lines: 'Linie lokalne',
    night_lines: 'Linie nocne',
    regular_lines: 'Linie zwykłe',
    regular_temporary_lines: 'Linie okresowe',
    special_lines: 'Linie specjalne',
    substitute_lines: 'Linie zastępcze',
    zone_lines: 'Linie strefowe',
    zone_temporary_lines: 'Linie strefowe okresowe'
  };

  ngOnInit(): void {
    this.initializeLines();
  }

  private initializeLines() {
    const cachedLines = this.cacheService.getCacheLines();
    cachedLines ? this.processResponse(cachedLines) : this.fetchLines();
  }

  private fetchLines(): void {
    this.linesService.getLines().subscribe({
      next: (data: Lines) => {
        this.cacheService.setCacheLines(data);
        this.processResponse(data);
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  private processResponse(responseLines: Lines) {
    for (const [key, lines] of Object.entries(responseLines)) {
      this.lines.set(key, lines);
    }
    this.filteredLines = new Map<string, string[]>(this.lines);
  }

  translateCategory(category: string): string {
    return this.categoryMapping[category] || category;
  }

  navigateToLine(lineNumber: string): void {
    this.router.navigate([`analyze/${lineNumber}`]);
  }

  //TODO i think we need to adjust trackby for maps
  trackByIndex(index: number, item: string): number {
    return index;
  }

  applyFilter(filterValue: EventTarget): void {
    this.lines.forEach((lines, category) => {
      const filteredItems = lines.filter((line: string) =>
        line.toLowerCase().includes((filterValue as HTMLInputElement).value.toLowerCase())
      );
      this.filteredLines.set(category, filteredItems);
    });
  }
}

