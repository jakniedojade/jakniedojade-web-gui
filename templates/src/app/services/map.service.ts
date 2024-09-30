import { Injectable } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { PolesDetails, Shapes } from '../interfaces/line-data';

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

  drawPoles(poles: PolesDetails[]): void {
    if (this.mapComponent) {
      this.mapComponent.drawPoles(poles);
    }
  }
}
