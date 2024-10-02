import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { Lines } from '../../interfaces/lines';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    NavigationButtonsComponent
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  providers: []
})

export class SearchComponent implements OnInit {
  private router = inject(Router);
  private linesService = inject(LinesService);
  private errorDialogService = inject(ErrorDialogService);

  private lines = new Map<string, string[]>();
  public nextButtonDisabled: boolean = true;
  public selectedLine: string = "";
  public filteredLines = new Map<string, string[]>();

  private categoryMapping: any = {
    cementaryLines: 'Linie cmentarne',
    expressLines: 'Linie ekspresowe',
    fastLines: 'Linie przyspieszone',
    fastTemporaryLines: 'Linie przyspieszone okresowe',
    localLines: 'Linie lokalne',
    nightLines: 'Linie nocne',
    regularLines: 'Linie zwykłe',
    regularTemporaryLines: 'Linie okresowe',
    specialLines: 'Linie specjalne',
    substituteLines: 'Linie zastępcze',
    zoneLines: 'Linie strefowe',
    zoneTemporaryLines: 'Linie strefowe okresowe'
  };

  ngOnInit(): void {
    this.fetchLines();
  }

  selectLine(line: string): void {
    this.selectedLine = line;
    this.nextButtonDisabled = false;
  }

  private fetchLines(): void {
    this.linesService.getLines().subscribe({
      next: (data: Lines) => {
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

  navigateToLine(lineNumber: string): void {
    this.router.navigate([`analyze/${lineNumber}`]);
  }

  navigateToWelcomeScreen(): void {
    this.router.navigate(["/"]);
  }
}

