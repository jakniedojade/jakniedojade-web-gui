import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { MapComponent } from '../components/map/map.component';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;

  setMapComponent(mapComponent: MapComponent) {
    this.mapComponent = mapComponent;
  }

  drawRoute(coords: L.LatLngExpression[]) {
    if (this.mapComponent) {
      this.mapComponent.drawRoute(coords);
    }
  }
}
