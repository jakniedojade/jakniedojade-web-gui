import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from "./side-menu/side-menu.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SideMenuComponent,
    MapComponent,
    RouterOutlet,
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jakniedojade';
}
