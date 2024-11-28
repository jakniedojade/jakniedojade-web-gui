import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { SearchComponent } from './components/search/search.component';
import { DirectionSelectionComponent } from './components/direction-selection/direction-selection.component';
import { PoleSelectionComponent } from './components/pole-selection/pole-selection.component';
import { DirectionAnalysisSelectionComponent } from './components/direction-analysis-selection/direction-analysis-selection.component';
import { PoleAnalysisSelectionComponent } from './components/pole-analysis-selection/pole-analysis-selection.component';
import { LinesOnPoleSelectionComponent } from './components/lines-on-pole-selection/lines-on-pole-selection.component';
import { DirectionMeanlatencySettingsComponent } from './components/direction-meanlatency-settings/direction-meanlatency-settings.component';
import { WrongRouteScreenComponent } from './components/wrong-route-screen/wrong-route-screen.component';

export const routes: Routes = [
    { 
      path: '', component: WelcomeScreenComponent,
    },
    { 
      path: 'search', component: SearchComponent,
    },
    {
        path: 'line/:routeLine', component: DirectionSelectionComponent,
    },
    {
        path: 'line/:routeLine/:direction', component: DirectionAnalysisSelectionComponent,
    },
    {
        path: 'line/:routeLine/:direction/real_schedule/settings', redirectTo: '', // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/real_schedule/results', redirectTo: '', // component: FutureComponent
    },
    {
        path: 'line/:routeLine/:direction/mean_latency/settings', component: DirectionMeanlatencySettingsComponent,
    },
    {
        path: 'line/:routeLine/:direction/mean_latency/results', redirectTo: '', // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName', component: PoleSelectionComponent,
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:routePoleName', component: PoleAnalysisSelectionComponent,
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/real_schedule/settings', redirectTo: '', // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:poleNumber/real_schedule/results', redirectTo: '', // component: FutureComponent
    },
    {
        path: 'stop/:routeStopId/:routeStopName/:routePoleName/lines', component: LinesOnPoleSelectionComponent,
    },
    { 
        path: 'results/:line/:directionSwapped/:startStop/:endStop', component: ResultsComponent, // TODO: Refactor this route
    },  
    {
        path: '**', pathMatch: 'full', component: WrongRouteScreenComponent,
    },   
];

