import { Component, inject, Input, OnInit } from '@angular/core';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { Router } from '@angular/router';
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { PoleDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';

enum AnalysisType {
  StopTimetable,
  Line,
}

@Component({
  selector: 'app-pole-analysis-type-selection',
  standalone: true,
  imports: [NavigationButtonsComponent],
  templateUrl: './pole-analysis-type-selection.component.html',
  styleUrl: './pole-analysis-type-selection.component.scss'
})
export class PoleAnalysisTypeSelectionComponent implements OnInit {
  private router = inject(Router);
  private errorDialogService = inject(ErrorDialogService);
  public mapService = inject(MapService);
  public polesOnStopService = inject(PolesOnStopService);

  public analysisTypeSelected: boolean = false;
  public analysisType: typeof AnalysisType = AnalysisType;
  public selectedAnalysisType!: AnalysisType;

  @Input() routePoleName!: string
  @Input() routeStopId!: number;
  @Input() routeStopName!: string;

  ngOnInit(): void {
    this.initializeSelectedPole();
  }

  private initializeSelectedPole(): void {
    const selectedPole = this.mapService.getSelectedPole();

    if (selectedPole) {
      this.mapService.clearLayers();
      this.mapService.drawPoles(Array.of(selectedPole));
    } else {
      this.findSelectedPoleFromRoute();
    }
  }

  private findSelectedPoleFromRoute(): void {
    this.polesOnStopService.getPolesOnStop(this.routeStopId).subscribe({
      next: (polesOnStop: PoleDetails[]) => {
        const selectedPole = polesOnStop.find(pole => this.routePoleName === pole.name);
        if (selectedPole) {
          this.mapService.drawPoles([selectedPole]);
        } else {
          this.errorDialogService.openErrorDialog(`Pole with name "${this.routePoleName}" not found.`);
        }
      },
      error: (err) => {
        console.error('Error loading poles on stop:', err);
        this.errorDialogService.openErrorDialog('Error loading poles on stop.');
      }
    });
  }

  selectAnalysisType(selectedAnalysisType: AnalysisType): void {
    this.analysisTypeSelected = true;
    this.selectedAnalysisType = selectedAnalysisType;
  }

  navigateToPoleOptions(): void {

  }

  navigateToPoleSelection(): void {
    this.router.navigate([`stop/${this.routeStopId}/${this.routeStopName}`])
  }
}
