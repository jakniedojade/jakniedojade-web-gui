import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-side-menu-steps',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule],
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
  currentRoute: string | undefined;
  
  constructor(private router: Router) {}

  ngOnInit() {
    this.currentRoute = this.router.url;
  }
}
