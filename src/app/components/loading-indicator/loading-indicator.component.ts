import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBar } from '@angular/material/progress-bar';
import { LoadingService } from '../../services/loading.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-loading-indicator',
  imports: [MatProgressBar, CommonModule],
  templateUrl: './loading-indicator.component.html',
  styleUrl: './loading-indicator.component.scss'
})
export class LoadingIndicatorComponent {
  private loadingService = inject(LoadingService);

  public isLoading: Subject<boolean> = this.loadingService.isLoading;
}
