import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LinesService } from '../lines.service';
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
  lines: any[] = [];
  component: any;

  constructor(private linesService: LinesService) { }

  onOutletLoaded(component: any): void {
    if (component instanceof LineSelectionComponent) {
      if (this.lines.length === 0) {
        this.linesService.getLines().subscribe(response => {
          console.log("fetch");
          this.lines = response;
          component.lines = this.lines;
        });
      } else {
        component.lines = this.lines;
      }
    }
  }
}
