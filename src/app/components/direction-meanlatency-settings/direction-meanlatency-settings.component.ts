import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError, of } from 'rxjs';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { LineDataService } from '../../services/line-data.service';
import { LinesService } from '../../services/lines.service';
import { MapService } from '../../services/map.service';
import { MatIcon } from '@angular/material/icon';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { DirectionMeanlatencyRouteSelectionComponent } from '../direction-meanlatency-route-selection/direction-meanlatency-route-selection.component';
import { WeekdaysSelectionComponent } from "../weekdays-selection/weekdays-selection.component";
import { PoleDetails } from '../../interfaces/line-data';

export enum MeanlatencyChildComponents {
  RouteSelection = 'routeSelection',
  WeekdaySelection = 'weekdaySelection',
  Settings = 'settings'
}

const COMPONENT_HEADERS = {
  [MeanlatencyChildComponents.RouteSelection]: 'Wybierz trasę',
  [MeanlatencyChildComponents.WeekdaySelection]: 'Wybierz dni tygodnia',
  [MeanlatencyChildComponents.Settings]: 'Wybierz opcje analizy'
};

@Component({
  selector: 'app-direction-meanlatency-settings',
  standalone: true,
  imports: [
    AsyncPipe,
    MatIcon,
    NavigationButtonsComponent,
    DirectionMeanlatencyRouteSelectionComponent,
    WeekdaysSelectionComponent
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
  public ChildComponents = MeanlatencyChildComponents;

  @Input() direction!: string;
  @Input() routeLine!: string;

  routeString = signal<string>('Wybierz trasę');

  lineIcon$ = this.activatedRoute.paramMap.pipe(
    switchMap((paramMap) => {
      return this.linesService.getLineIcon(paramMap.get('routeLine')!);
    })
  );

  selectedDirectionFromRoute$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => 
      this.lineDataService.getLineData(paramMap['routeLine'], paramMap['direction']).pipe(
        tap(lineData => {
          this.mapService.drawRoute(lineData.shapes, true); //these booleans determine whether we draw route and poles in gray
          this.mapService.drawPoles(lineData.poles, true);
        }),
      )
    ),
    catchError(error => {
      this.errorDialogService.openErrorDialog(error.message);
      return of(null);
    })
  );
  
  selectedComponentName = signal<MeanlatencyChildComponents>(MeanlatencyChildComponents.Settings);
  selectedComponentHeader = signal<string>(COMPONENT_HEADERS[MeanlatencyChildComponents.Settings]);
  
  selectComponent(componentName: MeanlatencyChildComponents): void {
    this.selectedComponentName.set(componentName);
    this.selectedComponentHeader.set(COMPONENT_HEADERS[componentName]);
  }

  setRangeFromRouteSelection(selectedRoutePoles: PoleDetails[]): void {
    this.routeString.set(`${selectedRoutePoles[0].name} -> ${selectedRoutePoles[selectedRoutePoles.length - 1].name}`)
  }

  navigateToDirectionAnalysisOptions(): void {
    this.router.navigate([`line/${this.routeLine}/${this.direction}`]);
  }
}
