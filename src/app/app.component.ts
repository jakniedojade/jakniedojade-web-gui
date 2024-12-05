import { Component } from '@angular/core';
import { MapComponent } from './components/map/map.component';
import { SideMenuComponent } from "./components/side-menu/side-menu.component";

@Component({
  selector: 'app-root',
  imports: [
    SideMenuComponent,
    MapComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'jakniedojade';
}
