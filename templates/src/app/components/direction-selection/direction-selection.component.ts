import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LineDataService } from '../../services/line-data.service';
import { forkJoin } from 'rxjs';
import { LineData, PoleDetails, Shape } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent],
  templateUrl: './direction-selection.component.html',
  styleUrl: './direction-selection.component.scss'
})
export class DirectionSelectionComponent implements OnInit, OnDestroy {
  private lineDataService = inject(LineDataService);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private router = inject(Router);
  
  @Input() routeLine!: string;
  public selectedDirectionStopName: string = "";
  public firstDirectionData: LineData | null = null;
  public secondDirectionData: LineData | null = null;

  public nextButtonDisabled = true;

  ngOnInit(): void {
    this.fetchLineData();
  }

  ngOnDestroy(): void {
    this.mapService.clearLayers();
    this.mapService.resetMapView();
  }

  private fetchLineData(): void {
    forkJoin<[LineData, LineData]>([
      this.lineDataService.getLineData(this.routeLine, false),
      this.lineDataService.getLineData(this.routeLine, true),
    ]).subscribe({
      next: ([firstDirectionData, secondDirectionData]) => {
        this.firstDirectionData = firstDirectionData;
        this.secondDirectionData = secondDirectionData;
      },
      error: (err) => {
        this.errorDialogService.openErrorDialog(err.message);
      }
    });
  }

  selectDirection(lineData: LineData) {
    this.selectedDirectionStopName = lineData.endStopName;
    this.nextButtonDisabled = false;
    this.drawRouteAndPoles(lineData.shapes, lineData.poles)
  }

  private drawRouteAndPoles(shapes: Shape[], poles: PoleDetails[]): void {
    this.mapService.drawRoute(shapes);
    this.mapService.drawPoles(poles);
  }

  navigateToLineAnalysisOptions(selectedDirection: string): void {
    
  }

  navigateToLineSelection(): void {
    this.router.navigate(["search"]);
  }
}
