import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { LineSelectionComponent } from './components/line-selection/line-selection.component';
import { SideMenuStepsComponent } from './components/side-menu-steps/side-menu-steps.component';
import { StopSelectionComponent } from './components/stop-selection/stop-selection.component';
import { ResultsComponent } from './components/results/results.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    {
        path: 'analyze',
        component: SideMenuStepsComponent,
        children: [
            { path: 'lines', component: LineSelectionComponent },
            { path: ':line', component: StopSelectionComponent },
            { path: 'results/:line/:directionSwapped/:startStop/:endStop', component: ResultsComponent },  //TODO is there a more elegant way to construct this url parameters?
        ]
    },
];
