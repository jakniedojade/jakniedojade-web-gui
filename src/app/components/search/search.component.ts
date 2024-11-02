import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { catchError, combineLatest, map, of, startWith, shareReplay, distinctUntilChanged, pairwise, debounceTime, merge, tap } from 'rxjs';
import { Stop } from '../../interfaces/stop';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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
  public linesService = inject(LinesService);
  private stopsService = inject(StopsService);
  private errorDialogService = inject(ErrorDialogService);
  
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
  
  lines$ = combineLatest([
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
      return of(null);
    }),
    shareReplay(1)
  );
  
  stops$ = combineLatest([
    this.stopsService.getStops(),
    this.inputText$
  ]).pipe(
    map(([stops, inputText]) => 
      stops.filter(stop => stop.name.toLowerCase().includes(inputText))
    ),
    catchError(err => {
      this.errorDialogService.openErrorDialog(err.message);
      return of(null);
    }),
    shareReplay(1)
  );
  

  manualTabSelection = signal<number>(0);
  private manualTabSelection$ = toObservable(this.manualTabSelection);

  private autoTabSelection$ = combineLatest([this.lines$, this.stops$]).pipe(
    debounceTime(0), //because lines and stops emit simultaneously
    map(([lines, stops]) => {
      const linesTabIndex: number = 0;
      const stopsTabIndex: number = 1;
      const hasLines = !!lines && Object.values(lines).some(lineArray => lineArray.length > 0);
      const hasStops = !!stops && stops.length > 0;
  
      if (hasLines && !hasStops) return linesTabIndex;
      if (!hasLines && hasStops) return stopsTabIndex;
      
      return this.manualTabSelection();
    }),
    distinctUntilChanged()
  );
    
  private currentTab$ = merge(this.autoTabSelection$, this.manualTabSelection$).pipe(
    startWith(0),
    distinctUntilChanged()
  );
  
  currentTab = toSignal(this.currentTab$);

  //TODO i think we need to adjust trackby for maps
  //TODO do we even need this?
  trackByIndex(index: number, item: string): number {
    return index;
  }
  
  navigateToLineOrStop(): void {
    if (this.stopSelection() !== null) {
      this.router.navigate([`stop/${this.stopSelection()?.id}/${this.stopSelection()?.name}`]);
    } else {
      this.router.navigate([`line/${this.lineSelection()}`]);
    }
  }
  
  navigateToWelcomeScreen(): void {
    this.router.navigate(["/"]);
  }

}