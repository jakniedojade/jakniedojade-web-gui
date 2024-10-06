import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PoleDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { Stop } from '../../interfaces/stop';

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent],
  templateUrl: './pole-selection.component.html',
  styleUrl: './pole-selection.component.scss'
})
export class PoleSelectionComponent implements OnInit {
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private router = inject(Router);
  private polesOnStopService = inject(PolesOnStopService)
  
  @Input() stopId!: number;
  @Input() stopName!: string;

  public poles: PoleDetails[] = [];
  public stop: Stop | null = null;
  public selectedPole: PoleDetails | null = null;

  public nextButtonDisabled = true;

  ngOnInit(): void {
    this.stop = {
      id: this.stopId,
      name: this.stopName
    }
    this.fetchPolesOnStop();
  }

  private fetchPolesOnStop(): void {
    if (this.stop) {
      this.polesOnStopService.getPolesOnStop(this.stop.id).subscribe({
        next: (poles: PoleDetails[]) => {
          this.poles = poles;
          //this.mapService.drawPoles(this.poles);
        },
        error: (error) => {
          this.errorDialogService.openErrorDialog(error.message);
        }
      });
    }
  }

  selectPole(pole: PoleDetails) {
    this.selectedPole = pole;
    this.nextButtonDisabled = false;
  }

  navigateToPoleAnalysisOptions(): void {
    
  }

  navigateToLineSelection(): void {
    this.router.navigate(["search"]);
  }
}
