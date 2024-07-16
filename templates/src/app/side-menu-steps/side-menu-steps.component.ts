import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu-steps',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './side-menu-steps.component.html',
  styleUrl: './side-menu-steps.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {displayDefaultIndicatorType: false},
    },
  ],
})
export class SideMenuStepsComponent {
  constructor() {}
}
