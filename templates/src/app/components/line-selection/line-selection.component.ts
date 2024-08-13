import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { StopsService } from '../../services/stops.service';
import { CacheService } from '../../services/cache.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

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
  readonly dialog = inject(MatDialog);

  private lines: string[] = [];
  public filteredLines: string[] = [];

  ngOnInit(): void {
    this.fetchLines();
  }

  fetchLines(): void {
    const cachedLines = this.cacheService.getCacheLines();

    if (!cachedLines) {
      this.linesService.getLines().subscribe({
        next: (data: any) => {
          this.cacheService.setCacheLines(data);
          this.lines = data;
          this.filteredLines = this.lines;
        },
        error: (error) => {
          this.openErrorDialog(error.message);
        }
      });
    } else {
      this.lines = this.cacheService.getCacheLines();
      this.filteredLines = this.lines;
    }
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

  openErrorDialog(message: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { errorMessage: message }
    });
  }
}
