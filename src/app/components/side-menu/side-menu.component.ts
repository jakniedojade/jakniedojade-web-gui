import { Component } from '@angular/core';
import { WelcomeScreenComponent } from '../../pages/home-page/welcome-screen/welcome-screen.component';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [WelcomeScreenComponent, RouterOutlet, LoadingIndicatorComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
})
export class SideMenuComponent {

}
