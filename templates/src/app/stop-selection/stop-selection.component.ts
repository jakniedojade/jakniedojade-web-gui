import { Component, Input } from '@angular/core';
import { StopsService } from '../stops.service';
import { Observable } from 'rxjs';
import { Stops } from '../stops';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stop-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stop-selection.component.html',
  styleUrl: './stop-selection.component.scss'
})
export class StopSelectionComponent {
  @Input() line!: string;
  line$!: Observable<Stops[]>;

  constructor(private stopsService: StopsService) {}

  ngOnInit(): void {
    this.line$ = this.stopsService.getStops(this.line);
    //Currently fetching 128 line by default so line string is undefined
  }
}
