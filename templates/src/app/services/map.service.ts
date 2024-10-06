import { Injectable, signal } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { PoleDetails, Shape } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;
  private selectedPole: PoleDetails | null = null;

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

  selectPole(pole: PoleDetails): void {
    if (this.mapComponent) {
      this.selectedPole = pole;
      this.mapComponent.openPolePopup(pole.name);
    }
  }

  getSelectedPole(): PoleDetails | null {
    return this.selectedPole;
  }
}
