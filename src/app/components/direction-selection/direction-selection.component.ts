import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LineDataService } from '../../services/line-data.service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { LineData } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';
import { AsyncPipe } from '@angular/common';
import { ErrorDialogComponent } from "../error-dialog/error-dialog.component";

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent, AsyncPipe, ErrorDialogComponent, ErrorDialogComponent],
  templateUrl: './direction-selection.component.html',
  styleUrl: './direction-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectionSelectionComponent {
  private lineDataService = inject(LineDataService);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  @Input() routeLine!: string;
  
  selectedDirection = signal<string | null>(null);

  directionsData$ = this.activatedRoute.paramMap.pipe(
    switchMap(paramMap => {
      const routeLine = paramMap.get('routeLine')!;
      return forkJoin([
        this.lineDataService.getLineData(routeLine, false),
        this.lineDataService.getLineData(routeLine, true)
      ]);
    }),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    }),
  );

  selectDirection(lineData: LineData) {
    this.selectedDirection.set(lineData.endStopName);
    this.mapService.drawRoute(lineData.shapes);
    this.mapService.drawPoles(lineData.poles);
  }

  navigateToLineAnalysisOptions(): void {
    
  }

  navigateToLineSelection(): void {
    this.mapService.clearLayers();
    this.mapService.resetMapView();
    this.router.navigate(["search"]);
  }
}