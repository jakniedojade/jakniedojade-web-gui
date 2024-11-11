import { Component, inject, input, output, signal } from '@angular/core';
import { MapService } from '../../services/map.service';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MeanlatencyChildComponents } from '../direction-meanlatency-settings/direction-meanlatency-settings.component';
import { LineData, PoleDetails } from '../../interfaces/line-data';

@Component({
  selector: 'app-direction-meanlatency-route-selection',
  standalone: true,
  imports: [NavigationButtonsComponent],
  templateUrl: './direction-meanlatency-route-selection.component.html',
  styleUrl: './direction-meanlatency-route-selection.component.scss'
})
export class DirectionMeanlatencyRouteSelectionComponent {
  private mapService = inject(MapService);

  directionData = input.required<LineData>();
  selectSettings = output<MeanlatencyChildComponents>();
  selectedRoute = output<PoleDetails[]>();
  
  selectedRoutePoles = signal<PoleDetails[]>([]);
  startingIndex = signal<number | null>(null);
  endingIndex = signal<number | null>(null);

  setIndex(index: number): void {
    let start: number | null = this.startingIndex();
    let end: number | null = this.endingIndex();
    
    if (start !== null && end !== null) {
      start = null;
      end = null;
    }
    
    if (start === null) {
      start = index;
    } else {
      end = index;
      if (end < start) [start, end] = [end, start];
      const data = this.directionData();
      this.mapService.drawSlicedRoute(data.shapes, data.poles, data.poles[start], data.poles[end]);
      this.selectedRoutePoles.set(this.directionData().poles.slice(start, end + 1));
    }

    this.startingIndex.set(start);
    this.endingIndex.set(end);
  }

  returnRouteAndGoToSettings(): void {
    this.selectedRoute.emit(this.selectedRoutePoles());
    this.goToSettings();
  }

  goToSettings(): void {
    this.selectSettings.emit(MeanlatencyChildComponents.Settings);
  }
}
