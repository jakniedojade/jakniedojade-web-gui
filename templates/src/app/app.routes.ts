import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { SearchComponent } from './components/search/search.component';
import { StopSelectionComponent } from './components/stop-selection/stop-selection.component';
import { ResultsComponent } from './components/results/results.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    {
        path: 'analyze',
        children: [
            { path: 'lines', component: SearchComponent },
            { path: ':line', component: StopSelectionComponent },
            { path: 'results/:line/:directionSwapped/:startStop/:endStop', component: ResultsComponent },  //TODO is there a more elegant way to construct this url parameters?
        ]
    },
];
