import { Component, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MapService } from '../../services/map.service';
import { LineDataService } from '../../services/line-data.service';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";

enum AnalysisType {
  TripTimeTable,
  RouteStatistics,
  None
}

@Component({
  selector: 'app-direction-analysis-selection',
  standalone: true,
  imports: [AsyncPipe, NavigationButtonsComponent],
  templateUrl: './direction-analysis-selection.component.html',
  styleUrl: './direction-analysis-selection.component.scss'
})
export class DirectionAnalysisSelectionComponent {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private lineDataService = inject(LineDataService);
  private activatedRoute = inject(ActivatedRoute);

  @Input() routeLine!: string;

  public enum: typeof AnalysisType = AnalysisType;

  selectedAnalysisType = signal<AnalysisType>(AnalysisType.None)

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

  navigateToDirectionOptions(): void {
	
  }

  navigateToDirectionSelection(): void {
    this.router.navigate([`line/${this.activatedRoute.snapshot.params['routeLine']}`])
  }
}