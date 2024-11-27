import { computed, Injectable, signal } from '@angular/core';
import { MapComponent } from '../components/map/map.component';
import { PoleDetails } from '../interfaces/line-data';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private mapComponent: MapComponent | null = null;
  #selectedPole = signal<PoleDetails | null>(null);
  public selectedPole = computed(() => this.#selectedPole());

  routeDrawn = signal<boolean>(false);
  grayRouteDrawn = signal<boolean>(false);

  setMapComponent(mapComponent: MapComponent): void {
    this.mapComponent = mapComponent;
  }

  clearLayers(): void {
    this.mapComponent!.clearMapLayers()
  }

  clearSlicedRouteLayers(): void {
    this.mapComponent!.clearSlicedRouteLayers();
  }

  drawRoute(shapes: [number, number][], grayPolyline: boolean = false): void {
    this.mapComponent!.drawRoute(shapes, grayPolyline);
    this.routeDrawn.set(grayPolyline ? false : true);
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
  
  drawSlicedRoute(shapes: [number, number][], poles: PoleDetails[], startingPole: PoleDetails, endingPole: PoleDetails) {
    const data = this.sliceRoute(poles, shapes, startingPole, endingPole)
    this.mapComponent!.drawSlicedRoute(data.shapes, data.poles);
  }

  private sliceRoute(poles: PoleDetails[], shapes: [number, number][], startingPole: PoleDetails, endingPole: PoleDetails) {
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
      
    const checkIfCoordinatesEqual = (x1: number, y1: number, x2: number, y2: number): boolean => {
      return x1 === x2 && y1 === y2;
    }

    poles.forEach(pole => {
      let closestCoord = shapes[0];
      let minDistance = Infinity;
  
      shapes.forEach(shape => {
        const distance = calculateDistance(pole.position.coordinates[0], pole.position.coordinates[1], shape[0],  shape[1]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCoord = shape;
        }
      });
  
      pole.position.coordinates[0] = closestCoord[0];
      pole.position.coordinates[1] = closestCoord[1];
    });
    const mappedPoles = poles;
    
    const firstPoleIndex = mappedPoles.findIndex(pole => pole.name === startingPole.name);
    const lastPoleIndex = mappedPoles.findIndex(pole => pole.name === endingPole.name);
    const slicedPoles = mappedPoles.slice(firstPoleIndex, lastPoleIndex + 1)
    
    const firstPoleLatitude = mappedPoles[firstPoleIndex].position.coordinates[0];
    const firstPoleLongitude = mappedPoles[firstPoleIndex].position.coordinates[1];
    const lastPoleLatitude = mappedPoles[lastPoleIndex].position.coordinates[0];
    const lastPoleLongitude = mappedPoles[lastPoleIndex].position.coordinates[1];

    const firstSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord[0], coord[1], firstPoleLatitude, firstPoleLongitude));
    const lastSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord[0], coord[1], lastPoleLatitude, lastPoleLongitude));
    
    const mappedShapes = shapes.slice(firstSliceIndex, lastSliceIndex + 1);

    return ({ poles: slicedPoles, shapes: mappedShapes });
  }
}
