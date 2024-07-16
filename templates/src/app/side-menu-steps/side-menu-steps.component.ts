import { Component } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-menu-steps',
  standalone: true,
  imports: [MatStepperModule, RouterOutlet],
  templateUrl: './side-menu-steps.component.html',
  styleUrl: './side-menu-steps.component.scss'
})
export class SideMenuStepsComponent {
  constructor(private router: Router) {}

  onStepChange(event: any) {
    const stepIndex = event.selectedIndex;
    const routes = ['lines', 'settings', 'results'];
    this.router.navigate([`/analyze/${routes[stepIndex]}`]);
  }
}
