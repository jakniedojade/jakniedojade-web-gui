import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import 'leaflet-active-area';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
  // private map!: L.Map;
  private centroid: L.LatLngExpression = [52.2302, 21.0101] //Warsaw

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

  ngOnInit(): void {
    this.initMap()
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
}
