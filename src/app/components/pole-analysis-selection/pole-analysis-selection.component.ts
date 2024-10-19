import { Component, inject, signal } from '@angular/core';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { PoleDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

enum AnalysisType {
  StopTimetable,
  Line,
  None
}

@Component({
  selector: 'app-pole-analysis-type-selection',
  standalone: true,
  imports: [NavigationButtonsComponent, AsyncPipe],
  templateUrl: './pole-analysis-selection.component.html',
  styleUrl: './pole-analysis-selection.component.scss'
})
export class PoleAnalysisSelectionComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private polesOnStopService = inject(PolesOnStopService);
  private activatedRoute = inject(ActivatedRoute);

  public enum: typeof AnalysisType = AnalysisType;

  selectedAnalysisType = signal<AnalysisType>(AnalysisType.None)

  selectedPoleFromRoute$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => 
      this.polesOnStopService.getPolesOnStop(paramMap['routeStopId']).pipe(
        map(poles => poles.find(pole => pole.name === paramMap['routePoleName'])),
        filter((pole): pole is PoleDetails => !!pole),
        tap(pole => {
          this.mapService.clearLayers();
          this.mapService.drawPoles([pole]);
          this.mapService.setSelectedPole(pole);
        }),
      )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    })
  );

  navigateToPoleOptions(): void {
    
  }

  navigateToLinesOnPoleSelection(): void {
    this.router.navigate([`lines`], { relativeTo: this.activatedRoute })
  }

  navigateToPoleSelection(): void {
    this.router.navigate([`stop/${this.activatedRoute.snapshot.params['routeStopId']}/${this.activatedRoute.snapshot.params['routeStopName']}`])
  }
}