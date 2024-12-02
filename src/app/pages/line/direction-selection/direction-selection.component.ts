import { ChangeDetectionStrategy, Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LineDataService } from '../../../services/line-data.service';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { LineData } from '../../../interfaces/line-data';
import { ErrorDialogService } from '../../../services/error-dialog.service';
import { NavigationButtonsComponent } from "../../../components/navigation-buttons/navigation-buttons.component";
import { MapService } from '../../../services/map.service';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { LinesService } from '../../../services/lines.service';
import { MatButton } from '@angular/material/button';
import { Line } from '../../../interfaces/lines';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent, AsyncPipe, MatIcon],
  templateUrl: './direction-selection.component.html',
  styleUrl: './direction-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DirectionSelectionComponent {
  private lineDataService = inject(LineDataService);
  private linesService = inject(LinesService);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  private line$: Observable<Line> = this.activatedRoute.paramMap.pipe(
    switchMap(paramMap => {
      const routeLine = paramMap.get('routeLine')!;
      return this.linesService.getLineIcon(routeLine).pipe(
        map(lineIcon => ({
          number: routeLine,
          icon: lineIcon
        }))
      );
    })
  );
  line = toSignal(this.line$);
  
  selectedDirection = signal<LineData | null>(null);

  directionsData$ = this.activatedRoute.paramMap.pipe(
    switchMap(paramMap => 
      this.lineDataService.getLineData(paramMap.get('routeLine')!)
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    }),
  );

  selectDirection(lineData: LineData) {
    this.selectedDirection.set(lineData);
    this.mapService.drawRoute(lineData.path.coordinates, lineData.poles);
  }

  navigateToDirectionAnalysisOptions(): void {
    this.router.navigate([`${this.selectedDirection()?.direction}`], { relativeTo: this.activatedRoute });
  }

  navigateToLineSelection(): void {
    this.mapService.clearLayers();
    this.mapService.resetMapView();
    this.router.navigate(["search"]);
  }
}