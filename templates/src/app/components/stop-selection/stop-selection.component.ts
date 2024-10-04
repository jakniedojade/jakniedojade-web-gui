import { Component, inject } from '@angular/core';
import { LineDataService } from '../../services/line-data.service';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { LineData, PolesDetails } from '../../interfaces/line-data';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";


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
    MatDatepickerModule,
    MatTooltipModule,
    NavigationButtonsComponent
  ],
  templateUrl: './stop-selection.component.html',
  styleUrl: './stop-selection.component.scss',
  providers: [provideNativeDateAdapter()]
})
export class StopSelectionComponent {
  private lineDataService = inject(LineDataService);
  private errorDialogService = inject(ErrorDialogService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private line: string = "";
  public poles: PolesDetails[] = [];
  public startIndex: number = 0;
  public endIndex!: number;
  private directionSwapped: boolean = false;
  
  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
    });
    this.fetchLineData();
  }

  private fetchLineData(): void {
    this.lineDataService.getLineData(this.line, this.directionSwapped).subscribe({
      next: (data: LineData) => {
        this.poles = data.poles;
        if (this.poles.length === 0) {
          const errorMessage = "No stops found for selected direction";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.endIndex = this.poles.length - 1;
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  swapDirection(): void {
    this.directionSwapped = !this.directionSwapped;
    this.fetchLineData();
  }

  navigateToResults(): void {
    this.router.navigate([`analyze/results/${this.line}/${this.directionSwapped}/${this.poles[this.startIndex].name}/${this.poles[this.endIndex].name}`]);
  }

  navigateToLineSelection(): void {
    this.router.navigate(["analyze/search"]);
  }
}
