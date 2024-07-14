import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { LineSelectionComponent } from './line-selection/line-selection.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'lines', component: LineSelectionComponent },
];
