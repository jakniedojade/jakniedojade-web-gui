import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError, of } from 'rxjs';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { LineDataService } from '../../services/line-data.service';
import { LinesService } from '../../services/lines.service';
import { MapService } from '../../services/map.service';
import { MatIcon } from '@angular/material/icon';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { DirectionMeanlatencyRouteSelectionComponent } from '../direction-meanlatency-route-selection/direction-meanlatency-route-selection.component';

@Component({
  selector: 'app-direction-meanlatency-settings',
  standalone: true,
  imports: [
    NgComponentOutlet,
    AsyncPipe,
    MatIcon,
    NavigationButtonsComponent,
    DirectionMeanlatencyRouteSelectionComponent,
  ],
  templateUrl: './direction-meanlatency-settings.component.html',
  styleUrl: './direction-meanlatency-settings.component.scss'
})
export class DirectionMeanlatencySettingsComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private lineDataService = inject(LineDataService);
  private linesService = inject(LinesService);
  private activatedRoute = inject(ActivatedRoute);

  @Input() routeLine!: string;
  lineIcon$ = this.activatedRoute.paramMap.pipe(
    switchMap((paramMap) => {
      return this.linesService.getLineIcon(paramMap.get('routeLine')!);
    })
  );

  selectedDirectionFromRoute$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => 
      this.lineDataService.getLineData(paramMap['routeLine'], paramMap['direction']).pipe(
        tap(lineData => {
          this.mapService.drawRoute(lineData.shapes);
          this.mapService.drawPoles(lineData.poles);
        }),
      )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    })
  );
  
  selectedComponentName: string = 'settings';

  selectComponent(componentName: string): void {
    this.selectedComponentName = componentName;
  }
}
