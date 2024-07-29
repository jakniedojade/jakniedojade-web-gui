import { Component } from '@angular/core';
import { StopsService } from '../../services/stops.service';
import { CacheService } from '../../services/cache.service';
import { Stops, StopsInfo } from '../../interfaces/stops';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

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
  line: string = "";
  stopsInfo: StopsInfo[] = [];
  startIndex: number = 0;
  endIndex!: number;
  
  constructor(private cacheService: CacheService, private stopsService: StopsService, route: ActivatedRoute) {
    route.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
    })
  }
  
  ngOnInit(): void {
    const cachedStops = this.cacheService.getCacheStops(this.line);
    if (cachedStops) {
      this.stopsInfo = cachedStops;
      this.endIndex = this.stopsInfo.length - 1;
    } else {
      this.fetchStopsFromService();
    }
  }

  fetchStopsFromService(): void {
    this.stopsService.fetchStops(this.line).subscribe((data: any) => {
      this.cacheService.setCacheStops(this.line, data.stops);
      this.stopsInfo = data.stops;
      this.endIndex = this.stopsInfo.length - 1;
    });
  }
}
