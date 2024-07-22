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
  line$!: Observable<Stops[]>;
  //TODO use stop name variable in form control
  panelStart = new FormControl('Szczęśliwice 05')
  panelEnd = new FormControl('Pl. Piłsudskiego 06')

  constructor(private stopsService: StopsService) {}

  ngOnInit(): void {
    this.line$ = this.stopsService.getStops(this.line);
    //Currently fetching 128 line by default so line string is undefined
  }
}
