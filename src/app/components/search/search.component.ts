import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { StopsService } from '../../services/stops.service';
import { catchError, combineLatest, map, of, startWith, shareReplay, distinctUntilChanged, pairwise, debounceTime, merge, tap, Observable } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Line } from '../../interfaces/lines';
import { Stop } from '../../interfaces/stop';

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
    { id: 7013, name: "Centrum" },
    { id: 2008, name: "Wiatraczna" },
    { id: 7009, name: "Marszałkowska" },
    { id: 7006, name: "Metro Politechnika" },
    { id: 5055, name: "Stare Bemowo" },
    { id: 2140, name: "Stacja Krwiodawstwa" },
    { id: 2097, name: "Saska" },
    { id: 7002, name: "Dw. Centralny" },
  ];

  inputText = new FormControl('');
  
  stopSelection = signal<Stop | null>(null);
  lineSelection = signal<Line | null>(null);

  inputText$ = this.inputText.valueChanges.pipe(
    startWith(''),
    map(inputText => inputText?.toLowerCase() ?? ''),
  );
  
  lines$: Observable<Line[]> = combineLatest([
    this.linesService.getLines(),
    this.inputText$,
  ]).pipe(
    map(([responseLines, inputText]) => 
      responseLines.filter((line: Line) => line.number.toLowerCase().includes(inputText))
    ),
    catchError(err => {
      this.errorDialogService.openErrorDialog(err.message);
      return of([]);
    }),
    shareReplay(1)
  );
  
  stops$ = combineLatest([
    this.stopsService.getStops(),
    this.inputText$
  ]).pipe(
    map(([stops, inputText]) => 
      stops.filter((stop: Stop) => stop.name.toLowerCase().includes(inputText))
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
      const hasLines = !!lines && lines.length > 0;
      const hasStops = !!stops && stops.length > 0;
  
      if (hasLines && !hasStops) return linesTabIndex;
      if (!hasLines && hasStops) return stopsTabIndex;
      
      return this.manualTabSelection();
    }),
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
      this.router.navigate([`line/${this.lineSelection()?.number}`]);
    }
  }
  
  navigateToWelcomeScreen(): void {
    this.router.navigate(["/"]);
  }
}