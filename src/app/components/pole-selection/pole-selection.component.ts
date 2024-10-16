import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoleDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent, AsyncPipe],
  templateUrl: './pole-selection.component.html',
  styleUrl: './pole-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoleSelectionComponent implements OnInit {
  private errorDialogService = inject(ErrorDialogService);
  public mapService = inject(MapService);
  private router = inject(Router);
  private polesOnStopService = inject(PolesOnStopService);
  private activatedRoute = inject(ActivatedRoute);

  polesOnStop$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => this.polesOnStopService.getPolesOnStop(paramMap['routeStopId'])),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    }),
    tap(poles => {
      this.mapService.clearLayers();
      this.mapService.drawPoles(poles!);
    })
  );

  ngOnInit(): void {
      this.mapService.setSelectedPole(null);
  }

  navigateToPoleAnalysisOptions(): void {
    
  }

  navigateToLineSelection(): void {
    this.mapService.clearLayers();
    this.mapService.resetMapView();
    this.router.navigate(["search"]);
  }
}
