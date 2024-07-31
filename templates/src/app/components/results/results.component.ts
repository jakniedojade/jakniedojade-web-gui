import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent {
  line: string = "";

  constructor(route: ActivatedRoute) {
    route.params.subscribe((lineParams: any) => {
      this.line = lineParams.line;
    })
  }
}
