import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDialogService } from '../../../services/error-dialog.service';
import { map } from 'rxjs/operators';
import { MapService } from '../../../services/map.service';
import { PolesOnStopService } from '../../../services/poles-on-stop.service';
import { catchError, filter, forkJoin, Observable, of, switchMap, tap } from 'rxjs';
import { PoleDetails } from '../../../interfaces/line-data';
import { LinesOnPoleService } from '../../../services/lines-on-pole.service';
import { AsyncPipe } from '@angular/common';
import { NavigationButtonsComponent } from "../../../components/navigation-buttons/navigation-buttons.component";
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LinesService } from '../../../services/lines.service';
import { LineOnPole } from '../../../interfaces/line-on-pole';

@Component({
  selector: 'app-lines-on-pole-selection',
  imports: [AsyncPipe, NavigationButtonsComponent, MatIcon, MatButton],
  templateUrl: './lines-on-pole-selection.component.html',
  styleUrl: './lines-on-pole-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinesOnPoleSelectionComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private polesOnStopService = inject(PolesOnStopService);
  private linesOnPoleService = inject(LinesOnPoleService);
  private activatedRoute = inject(ActivatedRoute);
  private linesService = inject(LinesService);

  lineSelection = signal<LineOnPole | null>(null);

  selectedPoleFromRoute$: Observable<PoleDetails | null> = this.activatedRoute.params.pipe(
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

  linesOnPole$: Observable<LineOnPole[]> = this.selectedPoleFromRoute$.pipe(
    switchMap(pole => 
      this.linesOnPoleService.getLinesOnPole(pole!.id).pipe(
          switchMap(lines => 
            forkJoin(
              lines.map(line => 
                this.linesService.getLineIcon(line.line).pipe(
                  map(icon => ({
                    line: line.line,
                    direction: line.direction,
                    headsign: line.headsign,
                    icon: icon
                  }))
                )
              )
            )
          )
        )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of([]);
    })
  );

  navigateToPoleAnalysisSelection(): void {
    const params = this.activatedRoute.snapshot.params;
    this.router.navigate([`stop/${params['routeStopId']}/${params['routeStopName']}/${this.mapService.selectedPole()?.name}`]);
  }
  
  navigateToAnalysisSelection(): void {
    this.router.navigate([`line/${this.lineSelection()?.line}/${this.lineSelection()?.direction}`]);
  }
}
