import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu-steps',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, CommonModule],
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
    console.log(this.currentRoute);
  }

  isActive(item: string) {
    switch(item) {
      case "lines":
        return this.currentRoute?.includes("analyze/lines") ? "active-step" : "";
      case "settings":
        return  /^.analyze\/\d+$/.test(item) == true ? "active-step" : ""; //fix this regex
      case "results":
        return this.currentRoute?.includes("settings") ? "active-step" : "";
      default:
        return "";
    }
  }
}
