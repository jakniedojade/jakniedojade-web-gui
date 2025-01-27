import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-wrong-route-screen',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './wrong-route-screen.component.html',
  styleUrl: './wrong-route-screen.component.scss'
})
export class WrongRouteScreenComponent {
  private router = inject(Router);
  public currentRoute = this.router.url;
}