import { Component } from '@angular/core';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [WelcomeScreenComponent, RouterOutlet],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {

}
