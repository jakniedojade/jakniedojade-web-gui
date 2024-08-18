import { Injectable } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { Stops, StopsInfo } from '../interfaces/stops';
import { Shapes } from '../interfaces/shapes';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;

  setMapComponent(mapComponent: MapComponent): void {
    this.mapComponent = mapComponent;
  }

  drawRoute(shapes: Shapes[]): void {
    if (this.mapComponent) {
      this.mapComponent.drawRoute(shapes);
    }
  }

  drawStops(stops: StopsInfo[]): void {
    if (this.mapComponent) {
      this.mapComponent.drawStops(stops);
    }
  }
}
