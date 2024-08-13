import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService } from '../../services/cache.service';
import { MapService } from '../../services/map.service';
import { ShapesService } from '../../services/shapes.service';
import { Shapes } from '../../interfaces/shapes';
import { ErrorDialogService } from '../../services/error-dialog.service';

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
      this.mapShapes(cachedShapes);
    }
  }
  
  fetchShapes(): void {
    //TEMPORARY REQUEST FOR FULL ROUTE ONLY (FROM FIRST TO LAST STOP)
    this.shapesService.getShapes(this.line, this.direction, this.startStop, this.endStop).subscribe({
      next: (data: any) => {
        if (!data.shapes || data.shapes.length === 0) {
          const errorMessage = "Brak shapes dla danej linii";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.cacheService.setCacheShapes(this.line, this.direction, data.shapes);
          this.mapShapes(data.shapes);
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  mapShapes(shapes: Shapes[]): void {
      const latLngArray = shapes.map((shape: Shapes) => ({
        lat: shape.point_latitude,
        lng: shape.point_longitude
      }));
      this.plotOnMap(latLngArray);
  }
  
  plotOnMap(latLngArray: { lat: number; lng: number }[]): void {
    this.mapService.drawRoute(latLngArray);
  }
}
