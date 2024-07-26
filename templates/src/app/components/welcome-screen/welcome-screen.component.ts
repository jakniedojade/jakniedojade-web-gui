import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './welcome-screen.component.html',
  styleUrl: './welcome-screen.component.scss'
})
export class WelcomeScreenComponent {
  constructor(private router: Router) { }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
