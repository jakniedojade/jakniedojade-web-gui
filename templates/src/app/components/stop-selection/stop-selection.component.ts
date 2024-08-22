import { Component, inject } from '@angular/core';
import { StopsService } from '../../services/stops.service';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

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
    MatButtonModule,
    MatDatepickerModule
  ],
  templateUrl: './stop-selection.component.html',
  styleUrl: './stop-selection.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class StopSelectionComponent {
  private stopsService = inject(StopsService);
  private errorDialogService = inject(ErrorDialogService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private line: string = "";
  public stopsInfo: StopsInfo[] = [];
  public startIndex: number = 0;
  public endIndex!: number;
  private directionSwapped: boolean = false;
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
    });
    this.fetchStops();
  }

  private fetchStops(): void {
    this.stopsService.getStops(this.line, this.directionSwapped).subscribe({
      next: (data: any) => {
        this.stopsInfo = data.stops;
        if (this.stopsInfo.length === 0) {
          const errorMessage = "Brak przystanków dla wybranego kierunku.";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.endIndex = this.stopsInfo.length - 1;
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  swapDirection(): void {
    this.directionSwapped = !this.directionSwapped;
    this.fetchStops();
  }

  navigateToResults(): void {
    this.router.navigate([`analyze/results/${this.line}/${this.directionSwapped}/${this.stopsInfo[this.startIndex].name}/${this.stopsInfo[this.endIndex].name}`]);
  }
}
