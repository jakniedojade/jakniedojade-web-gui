import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LineSelectionComponent } from '../line-selection/line-selection.component';

@Component({
  selector: 'app-side-menu-steps',
  standalone: true,
  imports: [
    RouterOutlet,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LineSelectionComponent
  ],
  templateUrl: './side-menu-steps.component.html',
  styleUrl: './side-menu-steps.component.scss',
})
export class SideMenuStepsComponent {

}
