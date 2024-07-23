import { Component, Input } from '@angular/core';
import { StopsService } from '../stops.service';
import { Observable } from 'rxjs';
import { Stops } from '../stops';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  panelStart: FormControl = new FormControl();
  panelEnd: FormControl = new FormControl();
  
  constructor(private stopsService: StopsService) {
    this.stops = [];
  }
  
  ngOnInit(): void {
    this.stops$ = this.stopsService.getStops(this.line);
    this.stops$.subscribe((response) => {
      this.stops = response;
      this.panelStart.setValue(this.stops[0].name);
      this.panelEnd.setValue(this.stops[this.stops.length - 1].name);
    })
  }
}
