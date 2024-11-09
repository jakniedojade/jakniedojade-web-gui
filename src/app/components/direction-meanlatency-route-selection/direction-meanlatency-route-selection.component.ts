import { Component, computed, EventEmitter, inject, Input, output, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MapService } from '../../services/map.service';
import { LineDataService } from '../../services/line-data.service';
import { BehaviorSubject, catchError, fromEvent, map, of, pairwise, Subject, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MatIcon } from '@angular/material/icon';
import { LinesService } from '../../services/lines.service';

@Component({
  selector: 'app-direction-meanlatency-route-selection',
  standalone: true,
  imports: [AsyncPipe, NavigationButtonsComponent, MatIcon],
  templateUrl: './direction-meanlatency-route-selection.component.html',
  styleUrl: './direction-meanlatency-route-selection.component.scss'
})
export class DirectionMeanlatencyRouteSelectionComponent {
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private lineDataService = inject(LineDataService);
  private activatedRoute = inject(ActivatedRoute);

  selectSettings = output<string>()

  startingIndex: number | null = null;
  endingIndex: number | null = null;

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

  setIndex(index: number): void {
    if (this.startingIndex !== null && this.endingIndex !== null) {
      this.startingIndex = null;
      this.endingIndex = null;
    }
    
    if (this.startingIndex === null) {
      this.startingIndex = index;
    } else {
      this.endingIndex = index;
    }
    
    if (this.endingIndex !== null && this.endingIndex < this.startingIndex) {
      const temp = this.endingIndex;
      this.endingIndex = this.startingIndex;
      this.startingIndex = temp;
    }
  }

  goToSettings(): void {
    this.selectSettings.emit('settings');
  }
}
