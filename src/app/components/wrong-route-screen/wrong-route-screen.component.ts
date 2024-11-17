import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-wrong-route-screen',
  standalone: true,
  imports: [MatButtonModule, RouterLink],
  templateUrl: './wrong-route-screen.component.html',
  styleUrl: './wrong-route-screen.component.scss'
})
export class WrongRouteScreenComponent implements OnInit {
private router = inject(Router);
  
public currentRoute = this.router.url
