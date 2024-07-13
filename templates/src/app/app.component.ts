import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { SideMenuComponent } from "./side-menu/side-menu.component";
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MapComponent,
    SideMenuComponent,
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatToolbar,
    MatIcon
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-app';
}
