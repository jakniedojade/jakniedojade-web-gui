import { Component, ElementRef, inject, OnInit} from '@angular/core';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import 'leaflet-active-area';
import 'leaflet.polyline.snakeanim';
import '../../plugins/leaflet-polyline-snakeanim.js';
import { fromEvent } from 'rxjs';
import {  startWith } from 'rxjs/operators';
import { MapService } from '../../services/map.service';
import { PoleDetails } from '../../interfaces/line-data';

@Component({
  selector: 'app-map',
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})

export class MapComponent implements OnInit {
  private mapService = inject(MapService);
  /**
   * Provide access to the DOM element
   */
  constructor(private elementRef: ElementRef<HTMLElement>) { }

  /**
   * Leaflet plugins don't have type definitions,
   * so we need to define 'any' type (or write
   * our own type definitions for needed functions).
   */
  private map!: any;
  private polyline!: any;
  private routeMarkersGroup: any;
  private slicedRouteMarkersGroup: any;
  private centroid: L.LatLngExpression = [52.2302, 21.0101] //Warsaw
  readonly defaultZoomLevel: number = 13;
  readonly minimumZoomLevel: number = 11;
  readonly maximumZoomLevel: number = 18
  private poleMarkers: L.Marker[] = [];
  private proj = L.CRS.EPSG3857;

  ngOnInit(): void {
    this.initMap()
    this.mapService.setMapComponent(this);
    this.routeMarkersGroup = L.layerGroup().addTo(this.map);
    this.slicedRouteMarkersGroup = L.layerGroup().addTo(this.map);
  }

  initMap() {
    this.map = L.map('map', {
      zoomControl: false,
      center: this.centroid,
      zoom: this.defaultZoomLevel,
      zoomSnap: 0.1,
      minZoom: this.minimumZoomLevel,
      maxZoom: this.maximumZoomLevel,
      maxBounds: L.latLngBounds([[51.967955, 20.394070], [52.584544, 21.469421]])
      //i just picked some bounds from google maps, modify to our liking
    });

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map)

    fromEvent(window, 'resize')
    .pipe(
      startWith(null),
    )
    .subscribe(() => {
      this.map.setActiveArea({
        position: 'absolute',
        top: '0',
        right: '0',
        bottom: '0',
        width: (window.innerWidth - document.getElementById('side-menu-container')!.offsetWidth) + 'px',
      }, false, false);
    });
  }

  zoomIn(): void {
    this.map.setZoom(this.map.getZoom() + 1);
  }

  zoomOut(): void {
    this.map.setZoom(this.map.getZoom() - 1);
  }

  private tempPoles: any = [] //used to store removed gray poles green route overwrites gray one
  private drawingTimeout: any;

  public clearMapLayers() {
    this.routeMarkersGroup.clearLayers();
    this.slicedRouteMarkersGroup.clearLayers();
    this.mapService.routeDrawn.set(false);
    this.poleMarkers = [];
    this.tempPoles = [];

    clearTimeout(this.drawingTimeout);
  }

  public drawRoute(shapes: [number, number][], grayPolyline: boolean = false): void {
    this.clearMapLayers();
    if (grayPolyline) {
      this.mapService.grayRouteDrawn.set(true);
      this.mapService.routeDrawn.set(false);
    } else {
      this.mapService.grayRouteDrawn.set(false);
      this.mapService.routeDrawn.set(true);
    }

    const shapesCoords = shapes.map((shape: [number, number]) => 
      this.proj.unproject(L.point([shape[0], shape[1]])));
    
    const polyline = new L.Polyline(shapesCoords)
    
    const routeBounds = polyline.getBounds().pad(0.1);
    this.map.fitBounds(routeBounds);

    this.polyline = new L.Polyline(shapesCoords, { 
      color: grayPolyline ? 'gray' : '#16a813', //TODO adjust gray to palette here and in SVGs!!
      snakingSpeed: 1800
    } as L.PolylineOptions);

    this.drawingTimeout = setTimeout(() => {
      this.polyline.addTo(this.map).snakeIn();
      this.routeMarkersGroup.addLayer(this.polyline);
    }, 300)
  }
  
  public drawPoles(polesToDraw: PoleDetails[], grayIcons: boolean = false): void {
    const stopIcon = L.icon({
      iconUrl: grayIcons ? '/assets/stop_regular_gray.svg' : '/assets/stop_regular.svg',
      iconSize: [13, 13]
    });
    const stopOnRequestIcon = L.icon({
      iconUrl: grayIcons ? '/assets/stop_on_request_gray.svg' : '/assets/stop_on_request.svg',
      iconSize: [13, 13]
    });

    const bounds = polesToDraw.map((pole: PoleDetails) => 
      this.proj.unproject(L.point([pole.position.coordinates[0], pole.position.coordinates[1]])));

    let poleClicked = false;
    polesToDraw.forEach((pole) => {
      //TODO adjust popup style and font
      const poleCoordinates = this.proj.unproject(L.point([pole.position.coordinates[0], pole.position.coordinates[1]]))
      const stopMarker = L.marker(poleCoordinates, {icon: pole.onDemand ? stopOnRequestIcon : stopIcon}).bindPopup(pole.name);

      const hoverArea = L.circleMarker((poleCoordinates), {
        radius: 10,
        opacity: 0,
        fillOpacity: 0,
        pane: 'popupPane' //because this pane has the highest z index
      });

      hoverArea.on({
        click: () => {
          this.mapService.setSelectedPole(pole);
          poleClicked = true;
        },
        mouseover: () => {
          stopMarker.openPopup();
          poleClicked = false;
        },
        mouseout: () => {
          if (!poleClicked) {
            stopMarker.closePopup();
          }
        }
      });
      hoverArea.addTo(this.map);
      stopMarker.addTo(this.map);
      this.routeMarkersGroup.addLayer(hoverArea);
      this.routeMarkersGroup.addLayer(stopMarker);
      polesToDraw.length > 1 ? this.poleMarkers.push(stopMarker) : stopMarker.openPopup();
    });
    if (!this.mapService.routeDrawn() && !this.mapService.grayRouteDrawn()) {
      this.map.fitBounds(L.latLngBounds(bounds).pad(0.2));
    }
  }

  public openPolePopup(poleName: string) {
    this.poleMarkers.forEach(marker => {
      const popupContent = marker.getPopup()?.getContent();
      if (popupContent === poleName) {
        marker.openPopup();
      }
    });
  }

  public clearSlicedRouteLayers(): void {
    this.slicedRouteMarkersGroup.clearLayers();
    this.tempPoles.forEach((marker: any) => {
      marker.addTo(this.map);
      this.routeMarkersGroup.addLayer(marker);
    });
    this.tempPoles = [];
  }
  
  public drawSlicedRoute(slicedShapes: [number, number][], slicedPoles: PoleDetails[]): void {
    this.clearSlicedRouteLayers();
    const shapesCoords = slicedShapes.map((shape: [number, number]) => 
      this.proj.unproject(L.point([shape[0], shape[1]])));

    this.polyline = new L.Polyline(shapesCoords, { 
      color: '#16a813',
      snakingSpeed: 1800,
      weight: 6
    } as L.PolylineOptions);
    this.polyline.addTo(this.map).snakeIn();
    this.slicedRouteMarkersGroup.addLayer(this.polyline);

    const stopIcon = L.icon({
      iconUrl: '/assets/stop_regular.svg',
      iconSize: [15, 15]
    });

    const stopOnRequestIcon = L.icon({
      iconUrl: '/assets/stop_on_request.svg',
      iconSize: [15, 15]
    });

    let poleClicked = false;

    slicedPoles.forEach((pole) => {
      this.poleMarkers.forEach(element => {
        if (element.getPopup()?.getContent() === pole.name) {
          this.tempPoles.push(element);
          element.remove();
        }
      });
      const stopMarker = L.marker(this.proj.unproject(L.point([pole.position.coordinates[0], pole.position.coordinates[1]])), {icon: pole.onDemand ? stopOnRequestIcon : stopIcon}).bindPopup(pole.name);

      const hoverArea = L.circleMarker(this.proj.unproject(L.point([pole.position.coordinates[0], pole.position.coordinates[1]])), {
        radius: 10,
        opacity: 0,
        fillOpacity: 0,
        pane: 'popupPane'
      });

      hoverArea.on({
        click: () => {
          this.mapService.setSelectedPole(pole);
          poleClicked = true;
        },
        mouseover: () => {
          stopMarker.openPopup();
          poleClicked = false;
        },
        mouseout: () => {
          if (!poleClicked) {
            stopMarker.closePopup();
          }
        }
      });
      //this.poleMarkers.push(stopMarker);
      hoverArea.addTo(this.map);
      stopMarker.addTo(this.map);
      this.slicedRouteMarkersGroup.addLayer(stopMarker);
    });
  }

  public resetMapView(): void {
    this.map.flyTo(this.centroid, this.defaultZoomLevel, {
      animate: true,
      duration: 1.5
    });
  }
}
