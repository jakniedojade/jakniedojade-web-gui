import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../../services/cache.service';
import { MapService } from '../../services/map.service';
import { ShapesService } from '../../services/shapes.service';
import { Shapes } from '../../interfaces/shapes';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { StopsService } from '../../services/stops.service';
import { Stops } from '../../interfaces/stops';

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
  private shapesService = inject(ShapesService);
  private errorDialogService = inject(ErrorDialogService);
  private stopsService = inject(StopsService);

  public line: string = "";
  private direction!: boolean;
  private startStop: string = "";
  private endStop: string = "";

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
      this.direction = lineParams.direction === 'true'; //this makes sure that direction is a boolean
      this.startStop = lineParams.startStop;
      this.endStop = lineParams.endStop;
    })
    this.initializeShapes();
  }

  initializeShapes(): void {
    const cachedShapes = this.cacheService.getCacheShapes(this.line, this.direction);
    if (!cachedShapes) {
      this.fetchShapes();
    } else {
      this.prepareStopsForMapping(cachedShapes);
    }
  }
  
  fetchShapes(): void {
    this.shapesService.getShapes(this.line, this.direction, this.startStop, this.endStop).subscribe({
      next: (data: any) => {
        if (!data.shapes || data.shapes.length === 0) {
          const errorMessage = "Brak shapes dla danej linii";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.cacheService.setCacheShapes(this.line, this.direction, data.shapes);
          this.prepareStopsForMapping(data.shapes);
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  prepareStopsForMapping(shapes: Shapes[]): void {
    const stopsData = this.cacheService.getCacheStops(this.line, this.direction);
    if (stopsData) {
      const mappedStops = this.mapStopCoordinatesToShapes(shapes, stopsData);
      this.drawRouteAndStops(shapes, mappedStops);     
    } else {
      this.stopsService.getStops(this.line, this.direction).subscribe((data: Stops) => {
        const mappedStops = this.mapStopCoordinatesToShapes(shapes, data);      
        this.drawRouteAndStops(shapes, mappedStops);
      });
    }
  }
  
  mapStopCoordinatesToShapes(shapes: Shapes[], stopsToMap: Stops): Stops {
    const calculateDistance = (x1: any, y1: any, x2: any, y2: any) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    stopsToMap.stops.forEach(stopToMap => {
      let closestCoord = shapes[0];
      let minDistance = calculateDistance(stopToMap.latitude, stopToMap.longitude, shapes[0].point_latitude, shapes[0].point_longitude);
  
      shapes.forEach(shape => {
        const distance = calculateDistance(stopToMap.latitude, stopToMap.longitude, shape.point_latitude, shape.point_longitude);
        if (distance < minDistance) {
          minDistance = distance;
          closestCoord = shape;
        }
      });
  
      stopToMap.latitude = closestCoord.point_latitude;
      stopToMap.longitude = closestCoord.point_longitude;
    });

    const mappedStops = stopsToMap;
    return mappedStops;
  }  

  private drawRouteAndStops(shapes: Shapes[], mappedStops: Stops): void{
    this.mapService.drawRoute(shapes);
    this.mapService.drawStops(mappedStops);
  }
}
