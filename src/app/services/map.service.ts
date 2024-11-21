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

  drawRoute(shapes: Shape[], grayPolyline: boolean = false): void {
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
  
  drawSlicedRoute(shapes: Shape[], poles: PoleDetails[], startingPole: PoleDetails, endingPole: PoleDetails) {
    const data = this.sliceRoute(poles, shapes, startingPole, endingPole)
    this.mapComponent!.drawSlicedRoute(data.shapes, data.poles);
  }

  private sliceRoute(poles: PoleDetails[], shapes: Shape[], startingPole: PoleDetails, endingPole: PoleDetails) {
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
        const distance = calculateDistance(pole.latitude, pole.longitude, shape.latitude, shape.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          closestCoord = shape;
        }
      });
  
      pole.latitude = closestCoord.latitude;
      pole.longitude = closestCoord.longitude;
    });
    const mappedPoles = poles;
    
    const firstPoleIndex = mappedPoles.findIndex(pole => pole.name === startingPole.name);
    const lastPoleIndex = mappedPoles.findIndex(pole => pole.name === endingPole.name);
    const slicedPoles = mappedPoles.slice(firstPoleIndex, lastPoleIndex + 1)
    
    const firstPoleLatitude = mappedPoles[firstPoleIndex].latitude;
    const firstPoleLongitude = mappedPoles[firstPoleIndex].longitude;
    const lastPoleLatitude = mappedPoles[lastPoleIndex].latitude;
    const lastPoleLongitude = mappedPoles[lastPoleIndex].longitude;

    const firstSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.latitude, coord.longitude, firstPoleLatitude, firstPoleLongitude));
    const lastSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.latitude, coord.longitude, lastPoleLatitude, lastPoleLongitude));
    
    const mappedShapes = shapes.slice(firstSliceIndex, lastSliceIndex + 1);

    return ({ poles: slicedPoles, shapes: mappedShapes });
  }
}
