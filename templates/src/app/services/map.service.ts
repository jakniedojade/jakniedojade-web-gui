import { Injectable } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { PoleDetails, Shape } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;

  setMapComponent(mapComponent: MapComponent): void {
    this.mapComponent = mapComponent;
  }

  clearLayers(): void {
    if (this.mapComponent) {
      this.mapComponent.clearMapLayers()
    }
  }

  drawRoute(shapes: Shape[]): void {
    if (this.mapComponent) {
      this.mapComponent.drawRoute(shapes);
    }
  }

  drawPoles(poles: PoleDetails[]): void {
    if (this.mapComponent) {
      this.mapComponent.drawPoles(poles);
    }
  }
}
