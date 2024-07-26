import { Component, Input } from '@angular/core';
import { StopsService } from '../../services/stops.service';
import { Observable } from 'rxjs';
import { Stops } from '../../interfaces/stops';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-stop-selection',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stop-selection.component.html',
  styleUrl: './stop-selection.component.scss'
})
export class StopSelectionComponent {
  @Input() line!: string;
  stops$!: Observable<Stops[]>;
  stops: Stops[];
  startIndex: number = 0;
  endIndex!: number;
  
  constructor(private stopsService: StopsService) {
    this.stops = [];
  }
  
  ngOnInit(): void {
    this.stops$ = this.stopsService.getStops(this.line);
    this.stops$.subscribe((response) => {
      this.stops = response;
      this.endIndex = this.stops.length - 1;
    })
  }
}
