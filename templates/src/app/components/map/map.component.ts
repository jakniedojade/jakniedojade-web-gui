import { Component, ElementRef, inject, Inject, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import 'leaflet-active-area';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapService } from '../../services/map.service';

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
  private markersGroup: any;
  // private map!: L.Map;
  private centroid: L.LatLngExpression = [52.2302, 21.0101] //Warsaw

  ngOnInit(): void {
    this.initMap()
    this.mapService.setMapComponent(this);
    this.markersGroup = L.layerGroup().addTo(this.map);
  }

  initMap() {
    this.map = L.map('map', {
      zoomControl: false,
      center: this.centroid,
      zoom: 13,
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

  public drawRoute(coords: L.LatLngExpression[]): void {
    this.markersGroup.clearLayers();
    const polyline = L.polyline(coords, { color: 'green' }).addTo(this.map);  //TODO adjust to color palette
    this.map.fitBounds(polyline.getBounds());
    this.markersGroup.addLayer(polyline);
  }
}
