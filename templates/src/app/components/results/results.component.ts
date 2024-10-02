import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapService } from '../../services/map.service';
import { PolesDetails, Shapes } from '../../interfaces/line-data';
import { ErrorDialogService } from '../../services/error-dialog.service';
import { LineDataService } from '../../services/line-data.service';
import { NavigationButtonsComponent } from "../navigation-buttons/navigation-buttons.component";

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [NavigationButtonsComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private mapService = inject(MapService);
  private errorDialogService = inject(ErrorDialogService);
  private lineDataService = inject(LineDataService);
  private router = inject(Router);

  public line: string = "";
  private directionSwapped!: boolean;
  private startStop: string = "";
  private endStop: string = "";

  ngOnInit(): void {
    this.loadRouteParams();
    this.fetchLineData();
  }

  private loadRouteParams(): void {
    this.activatedRoute.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
      this.directionSwapped = lineParams.directionSwapped === 'true'; //this makes sure that directionSwapped is a boolean
      this.startStop = lineParams.startStop;
      this.endStop = lineParams.endStop;
    })
  }

  private fetchLineData(): void {
    this.lineDataService.getLineData(this.line, this.directionSwapped).subscribe({
      next: (data: any) => {
        if (data.poles.length === 0) {
          const errorMessage = "No stops found for selected direction";
          this.errorDialogService.openErrorDialog(errorMessage);
        } else {
          this.prepareAndDraw(data.shapes, data.poles);
        }
      },
      error: (error) => {
        this.errorDialogService.openErrorDialog(error.message);
      }
    });
  }

  private prepareAndDraw(shapes: Shapes[], poles: PolesDetails[]): void {
    const slicedPoles = this.slicePoles(poles);
    const mappedPoles = this.mapPoleCoordinatesToShapes(shapes, slicedPoles);
    const slicedShapes = this.sliceShapes(shapes, mappedPoles);
    this.drawRouteAndPoles(slicedShapes, mappedPoles);
  }
  
  private slicePoles(allPoles: PolesDetails[]): PolesDetails[] {
    const firstPoleIndex = allPoles.findIndex((pole: PolesDetails)  => pole.name === this.startStop);
    const lastPoleIndex = allPoles.findIndex((pole: PolesDetails) => pole.name === this.endStop);

    return allPoles.slice(firstPoleIndex, lastPoleIndex + 1);
  }

  private mapPoleCoordinatesToShapes(shapes: Shapes[], polesToMap: PolesDetails[]): PolesDetails[] {
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    polesToMap.forEach(poleToMap => {
      let closestCoord = shapes[0];
      let minDistance = Infinity;
  
      shapes.forEach(shape => {
        const distance = calculateDistance(poleToMap.latitude, poleToMap.longitude, shape.latitude, shape.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          closestCoord = shape;
        }
      });
  
      poleToMap.latitude = closestCoord.latitude;
      poleToMap.longitude = closestCoord.longitude;
    });

    const mappedPoles = polesToMap;
    return mappedPoles;
  }

  private sliceShapes(shapes: Shapes[], mappedPoles: PolesDetails[]): Shapes[] {
    const checkIfCoordinatesEqual = (x1: number, y1: number, x2: number, y2: number): boolean => {
      return x1 === x2 && y1 === y2;
    }

    const firstPoleIndex = mappedPoles.findIndex(pole => pole.name === this.startStop);
    const lastPoleIndex = mappedPoles.findIndex(pole => pole.name === this.endStop);

    const firstPoleLatitude = mappedPoles[firstPoleIndex].latitude;
    const firstPoleLongitude = mappedPoles[firstPoleIndex].longitude;
    const lastPoleLatitude = mappedPoles[lastPoleIndex].latitude;
    const lastPoleLongitude = mappedPoles[lastPoleIndex].longitude;

    const firstSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.latitude, coord.longitude, firstPoleLatitude, firstPoleLongitude));
    const lastSliceIndex = shapes.findIndex(coord => checkIfCoordinatesEqual(coord.latitude, coord.longitude, lastPoleLatitude, lastPoleLongitude));
    return shapes.slice(firstSliceIndex, lastSliceIndex + 1);
  }

  private drawRouteAndPoles(shapes: Shapes[], poles: PolesDetails[]): void {
    this.mapService.drawRoute(shapes);
    this.mapService.drawPoles(poles);
  }

  navigateToLineSelection(): void {
    this.router.navigate(["analyze/search"]);
  }

  navigateToLine(): void {
    this.router.navigate([`analyze/${this.line}`])
  }
}
