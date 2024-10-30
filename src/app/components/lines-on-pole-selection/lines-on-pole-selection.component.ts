import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { map } from 'rxjs/operators';
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { catchError, combineLatest, filter, forkJoin, of, switchMap, tap } from 'rxjs';
import { PoleDetails } from '../../interfaces/line-data';
import { LinesOnPoleService } from '../../services/lines-on-pole.service';
import { AsyncPipe } from '@angular/common';
import { MapComponent } from "../map/map.component";
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LinesService } from '../../services/lines.service';
import { LineDataService } from '../../services/line-data.service';

@Component({
  selector: 'app-lines-on-pole-selection',
  standalone: true,
  imports: [AsyncPipe, MapComponent, NavigationButtonsComponent, MatIcon, MatButton],
  templateUrl: './lines-on-pole-selection.component.html',
  styleUrl: './lines-on-pole-selection.component.scss'
})
export class LinesOnPoleSelectionComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private polesOnStopService = inject(PolesOnStopService);
  private linesOnPoleService = inject(LinesOnPoleService);
  private activatedRoute = inject(ActivatedRoute);
  private linesService = inject(LinesService);

  lineSelection = signal<string>('');

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

  linesOnPole$ = this.selectedPoleFromRoute$.pipe(
    switchMap(pole => 
      this.linesOnPoleService.getLinesOnPole(pole!.id).pipe(
        switchMap(lines => 
          forkJoin(
            lines.map(line => 
              this.linesService.getLineIcon(line).pipe(
                map(icon => ({ lineNumber: line, icon }))
              )
            )
          )
        )
      )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    })
  );

  navigateToPoleAnalysisSelection(): void {
    const params = this.activatedRoute.snapshot.params;
    this.router.navigate([`stop/${params['routeStopId']}/${params['routeStopName']}/${this.mapService.selectedPole()?.name}`]);
  }
  
  navigateToDirectionSelection(): void {
    this.router.navigate([`line/${this.lineSelection()}`]);
  }
}
