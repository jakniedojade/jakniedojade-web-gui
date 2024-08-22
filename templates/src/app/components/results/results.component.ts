import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '../../services/map.service';
import { ShapesService } from '../../services/shapes.service';
import { Shapes } from '../../interfaces/shapes';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { StopsService } from '../../services/stops.service';
import { Stops, StopsInfo } from '../../interfaces/stops';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private mapService = inject(MapService);
  private shapesService = inject(ShapesService);
  private errorDialogService = inject(ErrorDialogService);
  private stopsService = inject(StopsService);

  public line: string = "";
  private directionSwapped!: boolean;
  private startStop: string = "";
  private endStop: string = "";

  ngOnInit(): void {
    this.loadRouteParams();
    this.fetchShapes();
  }

  private loadRouteParams(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
      this.directionSwapped = lineParams.directionSwapped === 'true'; //this makes sure that directionSwapped is a boolean
      this.startStop = lineParams.startStop;
      this.endStop = lineParams.endStop;
    })
  }
  
  private fetchShapes(): void {
    this.shapesService.getShapes(this.line, this.directionSwapped, this.startStop, this.endStop).subscribe({
      next: (data: any) => {
        if (!data.shapes || data.shapes.length === 0) {
          const errorMessage = "Brak shapes dla danej linii";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.fetchStops(data.shapes);
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  private fetchStops(shapes: Shapes[]): void {
    this.stopsService.getStops(this.line, this.directionSwapped).subscribe({
      next: (data: any) => {
        if (data.stops.length === 0) {
          const errorMessage = "Brak przystanków dla wybranego kierunku.";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.prepareAndDraw(shapes, data);
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  private prepareAndDraw(shapes: Shapes[], stops: Stops): void {
    const slicedStops = this.sliceStops(stops);
    const mappedStops = this.mapStopCoordinatesToShapes(shapes, slicedStops);
    const slicedShapes = this.sliceShapes(shapes, mappedStops);
    this.drawRouteAndStops(slicedShapes, mappedStops);
  }
  
  private sliceStops(allStops: Stops): StopsInfo[] {
    const firstStopIndex = allStops.stops.findIndex(stop => stop.name === this.startStop);
    const lastStopIndex = allStops.stops.findIndex(stop => stop.name === this.endStop);

    return allStops.stops.slice(firstStopIndex, lastStopIndex + 1);
  }

  private mapStopCoordinatesToShapes(shapes: Shapes[], stopsToMap: StopsInfo[]): StopsInfo[] {
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    stopsToMap.forEach(stopToMap => {
      let closestCoord = shapes[0];
      let minDistance = Infinity;
  
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

  private sliceShapes(shapes: Shapes[], mappedStops: StopsInfo[]): Shapes[] {
    const checkIfCoordinatesEqual = (x1: number, y1: number, x2: number, y2: number): boolean => {
      return x1 === x2 && y1 === y2;
    }

    const firstStopIndex = mappedStops.findIndex(stop => stop.name === this.startStop);
    const lastStopIndex = mappedStops.findIndex(stop => stop.name === this.endStop);

    const firstStopLatitude = mappedStops[firstStopIndex].latitude;
    const firstStopLongitude = mappedStops[firstStopIndex].longitude;
    const lastStopLatitude = mappedStops[lastStopIndex].latitude;
    const lastStopLongitude = mappedStops[lastStopIndex].longitude;

    const firstSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.point_latitude, coord.point_longitude, firstStopLatitude, firstStopLongitude));
    const lastSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.point_latitude, coord.point_longitude, lastStopLatitude, lastStopLongitude));
    return shapes.slice(firstSliceIndex, lastSliceIndex + 1);
  }

  private drawRouteAndStops(shapes: Shapes[], stops: StopsInfo[]): void {
    this.mapService.drawRoute(shapes);
    this.mapService.drawStops(stops);
  }
}
