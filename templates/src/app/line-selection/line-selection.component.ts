import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-line-selection',
  standalone: true,
  imports: [],
  templateUrl: './line-selection.component.html',
  styleUrl: './line-selection.component.scss'
})
export class LineSelectionComponent {
  constructor(private router: Router) { }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
