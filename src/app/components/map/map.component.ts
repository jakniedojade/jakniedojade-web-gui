import { Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import 'leaflet-active-area';
import 'leaflet.polyline.snakeanim';
import '../../plugins/leaflet-polyline-snakeanim.js';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapService } from '../../services/map.service';
import { PoleDetails, Shape } from '../../interfaces/line-data';

@Component({
  selector: 'app-map',
  standalone: true,
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
  private markersGroup: any;
  // private map!: L.Map;
  private centroid: L.LatLngExpression = [52.2302, 21.0101] //Warsaw
  private readonly defaultZoomLevel: number = 13;
  private poleMarkers: L.Marker[] = [];

  ngOnInit(): void {
    this.initMap()
    this.mapService.setMapComponent(this);
    this.markersGroup = L.layerGroup().addTo(this.map);
  }

  initMap() {
    this.map = L.map('map', {
      zoomControl: false,
      center: this.centroid,
      zoom: this.defaultZoomLevel,
      minZoom: 13,
      maxZoom: 18,
      maxBounds: L.latLngBounds([[51.944439, 20.554547], [52.521551, 21.475631]])
      //i just picked some bounds from google maps, modify to our liking
    });

    this.map.setActiveArea({
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      width: '66vw',
    }, true, false);

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map)
  }

  zoomIn(): void {
    this.map.setZoom(this.map.getZoom() + 1);
  }

  zoomOut(): void {
    this.map.setZoom(this.map.getZoom() - 1);
  }

  /**
   * When resized, set new active area of the map,
   * but don't recenter, cause it works kind of weird
   */
  ngAfterViewInit() {
    fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => {
        if(document.getElementById('main-component') != null) {
          if (window.innerWidth > 1200) {
            this.map.setActiveArea({
              position: 'absolute',
              top: '0',
              right: '0',
              bottom: '0',
              width: (window.innerWidth - document.getElementById('main-component')!.offsetWidth) + 'px',
            }, false, false);
          } else {
            this.map.setActiveArea({
              position: 'absolute',
              top: '0',
              right: '0',
              bottom: '0',
              width: '100vw',
            }, false, false);
          }
        }
      });
  }

  public clearMapLayers() {
    this.markersGroup.clearLayers();
  }

  public drawRoute(shapes: Shape[]): void {
    this.clearMapLayers();
    const shapesCoords = shapes.map((shape: Shape) => ({
      lat: shape.latitude,
      lng: shape.longitude
    }));
    
    const polyline = new L.Polyline(shapesCoords)
    
    const routeBounds = polyline.getBounds().pad(0.1);
    this.map.fitBounds(routeBounds);

    this.polyline = new L.Polyline(shapesCoords, { 
      color: '#16a813',
      snakingSpeed: 1800
    } as L.PolylineOptions);

    this.polyline.addTo(this.map).snakeIn();
    this.markersGroup.addLayer(this.polyline);
  }

  public drawPoles(polesToDraw: PoleDetails[]): void {
    const stopIcon = L.icon({
      iconUrl: '/assets/stop_regular.svg',
      iconSize: [13, 13]
    });

    const stopOnRequestIcon = L.icon({
      iconUrl: '/assets/stop_on_request.svg',
      iconSize: [13, 13]
    });

    const bounds = L.latLngBounds(polesToDraw.map((poleToDraw) => { 
      return [poleToDraw.latitude, poleToDraw.longitude]; 
    }));

    let poleClicked = false;
    polesToDraw.forEach((pole) => {
      //TODO adjust popup style and font
      const stopMarker = L.marker([pole.latitude, pole.longitude], {icon: pole.onDemand ? stopOnRequestIcon : stopIcon}).bindPopup(pole.name);
      stopMarker.on({
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
      this.poleMarkers.push(stopMarker);
      stopMarker.addTo(this.map);
      this.markersGroup.addLayer(stopMarker);
      polesToDraw.length > 1 ? this.poleMarkers.push(stopMarker) : stopMarker.openPopup();
    });
    this.map.fitBounds(bounds.pad(0.2));
  }

  public openPolePopup(poleName: string) {
    this.poleMarkers.forEach(marker => {
      const popupContent = marker.getPopup()?.getContent();
      if (popupContent === poleName) {
        marker.openPopup();
      }
    });
  }

  public resetMapView(): void {
    this.map.flyTo(this.centroid, this.defaultZoomLevel, {
      animate: true,
      duration: 1.5
    });
  }
}
