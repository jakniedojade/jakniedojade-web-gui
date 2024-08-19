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
  private errorDialogService = inject(ErrorDialogService)

  public lines: any[] = [];
  public filteredLines: string[] = [];
  public categories: string[] = [];

  public categoryMapping: any = {
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
    this.fetchLines();
  }

  fetchLines(): void {
    const cachedLines = this.cacheService.getCacheLines();

    if (!cachedLines) {
      this.linesService.getLines().subscribe({
        next: (data: any) => {
          this.cacheService.setCacheLines(data);
          this.lines = Object.entries(data);
          this.filteredLines = this.lines[1];
        },
        error: (error) => {
          this.errorDialogService.openErrorDialog(error.message);
        }
      });
    } else {
      this.lines = Object.entries(cachedLines);
      this.filteredLines = this.lines;
    }
  }

  getCategoryName(category: string): string {
    return this.categoryMapping[category] || category;
  }

  navigateToLine(lineNumber: string): void {
    this.router.navigate([`analyze/${lineNumber}`]);
  }

  // Add a trackBy function to improve performance when rendering the lines
  trackByIndex(index: number, item: string): number {
    return index;
  }

  // Filter lines based on input value
  applyFilter(filterValue: EventTarget): void {
    this.filteredLines = this.lines.filter((line) =>
        line.toLowerCase().includes((filterValue as HTMLInputElement).value.toLowerCase())
    );
    if(this.filteredLines.length == 0)
      this.filteredLines = this.lines;
  }
}
