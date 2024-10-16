import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { SearchComponent } from './components/search/search.component';
import { ResultsComponent } from './components/results/results.component';
import { DirectionSelectionComponent } from './components/direction-selection/direction-selection.component';
import { PoleSelectionComponent } from './components/pole-selection/pole-selection.component';
import { DirectionAnalysisSelectionComponent } from './components/direction-analysis-selection/direction-analysis-selection.component';
import { PoleAnalysisSelectionComponent } from './components/pole-analysis-selection/pole-analysis-selection.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'search', component: SearchComponent },
    {
        path: 'line/:routeLine', component: DirectionSelectionComponent
    },
    {
        path: 'line/:routeLine/:direction', component: DirectionAnalysisSelectionComponent
    },
    {
        path: 'line/:routeLine/:direction/real_schedule', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/real_schedule/settings', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/real_schedule/results', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/mean_latency', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/mean_latency/settings', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/mean_latency/results', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName', component: PoleSelectionComponent,
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:routePoleName', component: PoleAnalysisSelectionComponent,
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/real_schedule', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/real_schedule/settings', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/real_schedule/results', redirectTo: '' // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/lines', redirectTo: '' // component: FutureComponent
    },
    //THIS PATH IS HERE TEMPORARLY 
    { path: 'results/:line/:directionSwapped/:startStop/:endStop', component: ResultsComponent },  // TODO: Refactor this route
];

