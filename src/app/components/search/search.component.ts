import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { Lines } from '../../interfaces/lines';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { StopsService } from '../../services/stops.service';
import { catchError, combineLatest, map, Observable, of, startWith, filter } from 'rxjs';
import { Stop } from '../../interfaces/stop';
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
    NavigationButtonsComponent,
    MatTabsModule,
    MatIcon,
    ReactiveFormsModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchComponent {
  private router = inject(Router);
  private linesService = inject(LinesService);
  private stopsService = inject(StopsService);
  private errorDialogService = inject(ErrorDialogService);
  
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
  
  public popularStopsNames: Stop[] = [
    { id: 701300, name: "Centrum" },
    { id: 200800, name: "Wiatraczna" },
    { id: 700900, name: "Marszałkowska" },
    { id: 700600, name: "Metro Politechnika" },
    { id: 505500, name: "Stare Bemowo" },
    { id: 214000, name: "Stacja Krwiodawstwa" },
    { id: 209700, name: "Saska" },
    { id: 700200, name: "Dw. Centralny" },
  ];

  inputText = new FormControl('');
  
  stopSelection = signal<Stop | null>(null);
  lineSelection = signal<string>('');

  inputText$ = this.inputText.valueChanges.pipe(
    startWith(''),
    map(inputText => inputText ?? ''),
  );
  
  lines$: Observable<Lines> = combineLatest([
    this.linesService.getLines(),
    this.inputText$,
  ]).pipe(
    map(([lines, inputText]) => ({
      ...lines,
      ...Object.keys(lines).reduce((result, key) => ({
        ...result,
        [key]: lines[key as keyof Lines].filter(line =>
          line.toLowerCase().includes(inputText)
        )
      }), {})
    })),
    catchError(err => {
      this.errorDialogService.openErrorDialog(err.message);
      return of(({} as Lines));
    })
  );
  
  stops$: Observable<Stop[]> = combineLatest([
    this.stopsService.getStops(),
    this.inputText$
  ]).pipe(
    map(([stops, inputText]) => 
      stops.filter(stop => stop.name.toLowerCase().includes(inputText))
    ),
    catchError(err => {
      this.errorDialogService.openErrorDialog(err.message);
      return of([] as Stop[]);
    })
  );

  currentTab$ = combineLatest([
    this.lines$,
    this.stops$
  ]).pipe(
    map(([lines, stops]) => {
      const hasLines = Object.values(lines).some(lineArray => lineArray.length > 0);
      if (hasLines && stops.length === 0) {
        return 0;
      } else if (!hasLines && stops.length > 0) {
        return 1;
      }
      return undefined;
    }),
    filter(currentTab => currentTab !== undefined),
  );

  //TODO i think we need to adjust trackby for maps
  //TODO do we even need this?
  trackByIndex(index: number, item: string): number {
    return index;
  }
  
  navigateToLineOrStop(): void {
    if (this.stopSelection() !== null) {
      this.router.navigate([`stop/${this.stopSelection()?.name}/${this.stopSelection()?.id}`]);
    } else {
      this.router.navigate([`line/${this.lineSelection()}`]);
    }
  }
  
  navigateToWelcomeScreen(): void {
    this.router.navigate(["/"]);
  }

}