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
import { StopsService } from '../../services/stops.service';
import { forkJoin } from 'rxjs';
import { Stops } from '../../interfaces/stops';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    NavigationButtonsComponent,
    MatTabsModule,
    MatIcon
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  providers: []
})

export class SearchComponent implements OnInit {
  private router = inject(Router);
  private linesService = inject(LinesService);
  private stopsService = inject(StopsService);
  private errorDialogService = inject(ErrorDialogService);

  private lines = new Map<string, string[]>();
  private stops: Stops[] = [];
  public filteredStops: Stops[] = [];

  public selectedStop: Stops | null = null;
  public selectedLine: string = "";
  public filteredLines = new Map<string, string[]>();
  
  public nextButtonDisabled: boolean = true;
  public filterText: string = "";
  public selectedTabIndex: number = 0;

  public categoryIconsMapping: any = {
    cementaryLines: 'delete',
    expressLines: 'favorite',
    fastLines: 'menu',
    fastTemporaryLines: 'check',
    localLines: 'umbrella',
    nightLines: 'sunny',
    regularLines: 'home',
    regularTemporaryLines: 'curtains',
    specialLines: 'flare',
    substituteLines: 'undo',
    zoneLines: 'reply',
    zoneTemporaryLines: 'apps'
  };  //TODO that's just placeholders - change to our liking

  public popularStopsNames: Stops[] = [
    { id: 701300, name: "Centrum" },
    { id: 200800, name: "Wiatraczna" },
    { id: 700900, name: "Marszałkowska" },
    { id: 700600, name: "Metro Politechnika" },
    { id: 505500, name: "Stare Bemowo" },
    { id: 214000, name: "Stacja Krwiodawstwa" },
    { id: 209700, name: "Saska" },
    { id: 700200, name: "Dw. Centralny" },
  ];

  ngOnInit(): void {
    this.fetchLinesAndStops();
  }

  selectLine(line: string): void {
    this.selectedStop = null;
    this.selectedLine = line;
    this.nextButtonDisabled = false;
  }

  selectStop(stop: Stops): void {
    this.selectedLine = "";
    this.selectedStop = stop;
    this.nextButtonDisabled = false;
  }

  private fetchLinesAndStops(): void {
    forkJoin<[Lines, Stops[]]>([
      this.linesService.getLines(),
      this.stopsService.getStops(),
    ]).subscribe({
      next: ([lines, stops]) => {
        this.processResponse(lines);
        this.stops = stops;
      },
      error: (err) => {
        this.errorDialogService.openErrorDialog(err.message);
      }
    });
  }

  private processResponse(responseLines: Lines) {
    for (const [key, lines] of Object.entries(responseLines)) {
      this.lines.set(key, lines);
    }
    this.filteredLines = new Map<string, string[]>(this.lines);
  }

  //TODO i think we need to adjust trackby for maps
  trackByIndex(index: number, item: string): number {
    return index;
  }

  applyFilter(filterValue: EventTarget): void {
    this.filterText = (filterValue as HTMLInputElement).value.toLowerCase();

    this.lines.forEach((lines, category) => {
      const filteredItems = lines.filter((line: string) =>
        line.toLowerCase().includes(this.filterText)
      );
      this.filteredLines.set(category, filteredItems);
    });

    this.filteredStops = this.stops.filter((stop: Stops) =>
      stop.name.toLowerCase().includes(this.filterText)
    );

    //switch tabs accordingly
    if (this.checkIfMapHasValues(this.filteredLines) && this.filteredStops.length === 0) {
      this.selectedTabIndex = 0;
    }
    if (this.filteredStops.length > 0 && !this.checkIfMapHasValues(this.filteredLines)) {
      this.selectedTabIndex = 1;
    }
  }

  private checkIfMapHasValues(map: Map<string, string[]>): boolean {
    for (const value of map.values()) {
      if (value.length > 0) {
        return true;
      }
    }
    return false;
  }

  navigateToLineOrStop(): void {
    if (this.selectedStop) {
      //this.router.navigate([`stop/${selectedStop.name}`]);
    } else {
      this.router.navigate([`line/${this.selectedLine}`]);
    }
  }

  navigateToWelcomeScreen(): void {
    this.router.navigate(["/"]);
  }
}

