import { Component, inject, input, model, OnInit, output, signal } from '@angular/core';
import { MapService } from '../../services/map.service';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";
import { MeanlatencyChildComponents } from '../direction-meanlatency-settings/direction-meanlatency-settings.component';
import { LineData, PoleDetails } from '../../interfaces/line-data';

export interface RouteSelectionState {
  selectedRoute: PoleDetails[],
  startingIndex: number | undefined;
  endingIndex: number | undefined;
}

@Component({
  selector: 'app-direction-meanlatency-route-selection',
  standalone: true,
  imports: [NavigationButtonsComponent],
  templateUrl: './direction-meanlatency-route-selection.component.html',
  styleUrl: './direction-meanlatency-route-selection.component.scss'
})
export class DirectionMeanlatencyRouteSelectionComponent implements OnInit{
  private mapService = inject(MapService);

  directionData = input.required<LineData>();
  state = model<RouteSelectionState>();
  selectSettings = output<MeanlatencyChildComponents>();

  startingIndex = signal<number | undefined>(undefined);
  endingIndex = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.startingIndex.set(this.state()?.startingIndex);
    this.endingIndex.set(this.state()?.endingIndex);      
  }

  setIndex(index: number): void {
    let start = this.startingIndex();
    let end = this.endingIndex();

    if (start !== undefined && end !== undefined) {
      start = undefined;
      end = undefined;
    }

    const data = this.directionData();
    if (start === undefined) {
      start = index;
    } else {
      end = index;
      if (end < start) [start, end] = [end, start];
      this.mapService.drawSlicedRoute(data.shapes, data.poles, data.poles[start], data.poles[end]);
    }

    this.startingIndex.set(start);
    this.endingIndex.set(end);
  }
  
  setRouteAndGoToSettings(): void {
    this.state.update((state) => ({
      ...state,
      selectedRoute: this.directionData().poles.slice(this.startingIndex()!, this.endingIndex()! + 1),
      startingIndex: this.startingIndex(),
      endingIndex: this.endingIndex()
    }));
    
    this.selectSettings.emit(MeanlatencyChildComponents.Settings);
  }

  goToSettings(): void {
    if (this.state()?.startingIndex !== undefined && this.state()?.endingIndex !== undefined) {
      this.mapService.drawSlicedRoute(this.directionData().shapes, this.directionData().poles,
        this.directionData().poles[this.state()?.startingIndex!], this.directionData().poles[this.state()?.endingIndex!]);
    }
    this.selectSettings.emit(MeanlatencyChildComponents.Settings);
  }
}
