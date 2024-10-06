import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoleDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent],
  templateUrl: './pole-selection.component.html',
  styleUrl: './pole-selection.component.scss'
})
export class PoleSelectionComponent implements OnInit {
  private errorDialogService = inject(ErrorDialogService);
  public mapService = inject(MapService);
  private router = inject(Router);
  private polesOnStopService = inject(PolesOnStopService)
  
  @Input() routeStopId!: number;
  @Input() routeStopName!: string;

  public poles: PoleDetails[] = [];

  ngOnInit(): void {
    this.fetchPolesOnStop();
    this.mapService.selectPole(null);
  }

  private fetchPolesOnStop(): void {
    this.polesOnStopService.getPolesOnStop(this.routeStopId).subscribe({
      next: (poles: PoleDetails[]) => {
        this.poles = poles;
        this.mapService.clearLayers();
        this.mapService.drawPoles(this.poles);
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  navigateToPoleAnalysisOptions(): void {
    
  }

  navigateToLineSelection(): void {
    this.router.navigate(["search"]);
  }
}
