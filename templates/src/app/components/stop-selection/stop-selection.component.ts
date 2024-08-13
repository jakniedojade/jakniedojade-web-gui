import { Component, inject } from '@angular/core';
import { StopsService } from '../../services/stops.service';
import { CacheService } from '../../services/cache.service';
import { StopsInfo } from '../../interfaces/stops';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ErrorDialogService } from '../../services/error-dialog.service';

@Component({
  selector: 'app-stop-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './stop-selection.component.html',
  styleUrl: './stop-selection.component.scss'
})
export class StopSelectionComponent {
  private cacheService = inject(CacheService);
  private stopsService = inject(StopsService);
  private errorDialogService = inject(ErrorDialogService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private line: string = "";
  public stopsInfo: StopsInfo[] = [];
  public startIndex: number = 0;
  public endIndex!: number;
  private direction: boolean = false;
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
      this.initializeStops();
    });
  }

  initializeStops(): void {
    const cachedStops = this.cacheService.getCacheStops(this.line, this.direction);
    if (cachedStops) {
      this.stopsInfo = cachedStops.stops;
      this.endIndex = this.stopsInfo.length - 1;
    } else {
      this.fetchStops();
    }
  }

  fetchStops(): void {
    this.stopsService.getStops(this.line, this.direction).subscribe({
      next: (data: any) => {
        this.stopsInfo = data.stops;
        if (this.stopsInfo.length === 0) {
          const errorMessage = "Brak przystanków dla wybranego kierunku.";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.cacheService.setCacheStops(this.line, data);
          this.endIndex = this.stopsInfo.length - 1;
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  swapDirection(): void {
    this.direction = !this.direction;
    this.initializeStops();
  }

  navigateToResults(): void {
    this.router.navigate([`analyze/results/${this.line}/${this.direction}/${this.stopsInfo[0].name}/${this.stopsInfo[this.stopsInfo.length - 1].name}`]);
  }
}
