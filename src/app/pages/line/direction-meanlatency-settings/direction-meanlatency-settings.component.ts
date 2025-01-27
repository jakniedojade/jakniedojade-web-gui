import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, Input, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError, of, map } from 'rxjs';
import { ErrorDialogService } from '../../../services/error-dialog.service';
import { LineDataService } from '../../../services/line-data.service';
import { LinesService } from '../../../services/lines.service';
import { MapService } from '../../../services/map.service';
import { MatIcon } from '@angular/material/icon';
import { NavigationButtonsComponent } from "../../../components/navigation-buttons/navigation-buttons.component";
import { DirectionMeanlatencyRouteSelectionComponent, RouteSelectionState } from '../direction-meanlatency-route-selection/direction-meanlatency-route-selection.component';
import { regularWeekdays, saturdaysAndHolidays, Weekdays, WeekdaysSelectionComponent } from "../../../components/weekdays-selection/weekdays-selection.component";

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

  routeSelectionState = signal<RouteSelectionState>({
    selectedRoute: [],
    startingIndex: undefined,
    endingIndex: undefined,
  });

  selectedRouteString = computed(() => {
    const poles = this.routeSelectionState().selectedRoute;
    return poles.length > 0
      ? `${poles[0].name} -> ${poles[poles.length - 1].name}`
      : 'Wybierz trasę';
  });

  selectedWeekdays = signal<Weekdays>(regularWeekdays);
  selectedWeekdaysString = computed(() => {
    if (JSON.stringify(this.selectedWeekdays()) === JSON.stringify(regularWeekdays)) {
      return 'Powszednie';
    } else if (JSON.stringify(this.selectedWeekdays()) === JSON.stringify(saturdaysAndHolidays)) {
      return 'Soboty i święta';
    } else {
      return 'Niestandardowe';
    }
  });

  lineIcon$ = this.activatedRoute.paramMap.pipe(
    switchMap((paramMap) => {
      return this.linesService.getLineIcon(paramMap.get('routeLine')!);
    })
  );

  selectedDirectionFromRoute$ = this.activatedRoute.params.pipe(
    switchMap(paramMap => 
      this.lineDataService.getLineData(paramMap['routeLine']).pipe(
        map(lineData => lineData.find(data => data.direction.toString() === paramMap['direction'])),
        tap(lineData => {
          if (lineData) {
            this.mapService.drawRoute(lineData.path.coordinates, lineData.poles, true);
          }
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

  navigateToDirectionAnalysisOptions(): void {
    this.router.navigate([`line/${this.routeLine}/${this.direction}`]);
  }
}
