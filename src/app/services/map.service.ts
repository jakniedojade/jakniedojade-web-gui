import { computed, Injectable, signal } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { PoleDetails, Shape } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;
  #selectedPole = signal<PoleDetails | null>(null);
  public selectedPole = computed(() => this.#selectedPole());

  setMapComponent(mapComponent: MapComponent): void {
    this.mapComponent = mapComponent;
  }

  clearLayers(): void {
    this.mapComponent!.clearMapLayers()
  }

  drawRoute(shapes: Shape[]): void {
    this.mapComponent!.drawRoute(shapes);
  }

  drawPoles(poles: PoleDetails[]): void {
    this.mapComponent!.drawPoles(poles);
  }

  setSelectedPole(pole: PoleDetails | null): void {
    this.#selectedPole.set(pole);
    if (pole) {
      this.mapComponent!.openPolePopup(pole.name);
    }
  }

  resetMapView(): void {
    this.mapComponent!.resetMapView();
  }
}
