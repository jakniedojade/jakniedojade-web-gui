import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../../services/cache.service';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit{
  private activatedRoute = inject(ActivatedRoute);
  private cacheService = inject(CacheService);
  private mapService = inject(MapService);

  public line: string = "";

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
    })
    this.getShapes(this.line, false); //TEMPORARY SET DIRECTION AS FALSE
  }

  getShapes(line: string, direction: boolean): void {
    const shapes = this.cacheService.getCacheShapes(line, direction);

    if (shapes && shapes.length > 0) {
      const latLngArray = shapes.map(shape => ({
        lat: shape.point_latitude,
        lng: shape.point_longitude
      }));
  
      this.plotOnMap(latLngArray);
    } else {
      console.log('No shapes found for the given line and direction.');
    }
  }
  
  plotOnMap(latLngArray: { lat: number; lng: number }[]): void {
    this.mapService.drawRoute(latLngArray);
  }
}
