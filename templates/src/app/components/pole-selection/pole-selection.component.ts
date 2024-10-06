import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PolesDetails } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { MatButton } from '@angular/material/button';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MapService } from '../../services/map.service';
import { PolesOnStopService } from '../../services/poles-on-stop.service';
import { Stops } from '../../interfaces/stops';

@Component({
  selector: 'app-direction-selection',
  standalone: true,
  imports: [MatButton, NavigationButtonsComponent],
  templateUrl: './pole-selection.component.html',
  styleUrl: './pole-selection.component.scss'
})
export class PoleSelectionComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private errorDialogService = inject(ErrorDialogService);
  private mapService = inject(MapService);
  private router = inject(Router);
  private polesOnStopService = inject(PolesOnStopService)
  
  public poles: PolesDetails[] = [];
  public stop: Stops | null = null;
  public selectedPole: PolesDetails | null = null;

  public nextButtonDisabled = true;

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.stop = {
        id: lineParams.stopId,
        name: lineParams.stopName
      }
    });
    this.fetchPolesOnStop();
  }

  private fetchPolesOnStop(): void {
    if (this.stop) {
      this.polesOnStopService.getPolesOnStop(this.stop.id).subscribe({
        next: (poles: PolesDetails[]) => {
          this.poles = poles;
          //this.mapService.drawPoles(this.poles);
        },
        error: (error) => {
          this.errorDialogService.openErrorDialog(error.message);
        }
      });
    }
  }

  selectPole(pole: PolesDetails) {
    this.selectedPole = pole;
    this.nextButtonDisabled = false;
  }

  navigateToPoleAnalysisOptions(): void {
    
  }

  navigateToLineSelection(): void {
    this.router.navigate(["search"]);
  }
}
