import { Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDialogService } from '../../../services/error-dialog.service';
import { MapService } from '../../../services/map.service';
import { LineDataService } from '../../../services/line-data.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NavigationButtonsComponent } from "../../../components/navigation-buttons/navigation-buttons.component";
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { LinesService } from '../../../services/lines.service';
import { toSignal } from '@angular/core/rxjs-interop';

enum AnalysisType {
  RealSchedule,
  MeanLatency,
  None
}

@Component({
  selector: 'app-direction-analysis-selection',
  standalone: true,
  imports: [AsyncPipe, NavigationButtonsComponent, MatRipple, MatIcon],
  templateUrl: './direction-analysis-selection.component.html',
  styleUrl: './direction-analysis-selection.component.scss'
})
export class DirectionAnalysisSelectionComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private lineDataService = inject(LineDataService);
  private linesService = inject(LinesService);
  private activatedRoute = inject(ActivatedRoute);

  public enum: typeof AnalysisType = AnalysisType;

  @Input() routeLine!: string;
  lineIcon$ = this.activatedRoute.paramMap.pipe(
    switchMap((paramMap) => {
      return this.linesService.getLineIcon(paramMap.get('routeLine')!);
    })
  );

  selectedAnalysisType = signal<AnalysisType>(AnalysisType.None)

  selectedDirectionFromRoute$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => 
      this.lineDataService.getLineData(paramMap['routeLine']).pipe(
        map(lineData => lineData.find(data => data.direction.toString() === paramMap['direction'])),
        tap(lineData => {
          if (lineData && !this.mapService.routeDrawn()) {
            this.mapService.drawRoute(lineData.path.coordinates, lineData.poles);
          }
        }),
      )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    })
  );

  navigateToRealScheduleSettings(): void {
    this.router.navigate([`real_schedule/settings`], { relativeTo: this.activatedRoute });
  }

  navigateToMeanLatencySettings(): void {
    this.router.navigate([`mean_latency/settings`], { relativeTo: this.activatedRoute });
  }

  navigateToDirectionSelection(): void {
    this.router.navigate([`line/${this.activatedRoute.snapshot.params['routeLine']}`])
  }
}
