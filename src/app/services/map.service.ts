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

  drawRoute(shapes: Shape[], grayPolyline: boolean = false): void {
    this.mapComponent!.drawRoute(shapes, grayPolyline);
  }

  drawPoles(poles: PoleDetails[], grayIcons: boolean = false): void {
    this.mapComponent!.drawPoles(poles, grayIcons);
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
