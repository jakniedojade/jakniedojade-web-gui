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
  cacheService = inject(CacheService);
  stopsService = inject(StopsService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);

  line: string = "";
  stopsInfo: StopsInfo[] = [];
  startIndex: number = 0;
  endIndex!: number;
  direction: boolean = false;
  
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
      this.fetchStopsFromService(this.direction);
    }
  }

  fetchStopsFromService(direction: boolean): void {
    this.stopsService.fetchStops(this.line, direction).subscribe((data: any) => {
      this.cacheService.setCacheStops(this.line, data);
      this.stopsInfo = data.stops;
      this.endIndex = this.stopsInfo.length - 1;
    });
  }

  swapDirection(): void {
    this.direction = !this.direction;
    this.ngOnInit();
  }

  navigateToResults() {
    this.router.navigate([`analyze/results/${this.line}`]);
  }
}
