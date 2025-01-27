import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './pages/home-page/welcome-screen/welcome-screen.component';
import { SearchComponent } from './pages/search/search.component';
import { DirectionSelectionComponent } from './pages/line/direction-selection/direction-selection.component';
import { PoleSelectionComponent } from './pages/stop/pole-selection/pole-selection.component';
import { DirectionAnalysisSelectionComponent } from './pages/line/direction-analysis-selection/direction-analysis-selection.component';
import { PoleAnalysisSelectionComponent } from './pages/stop/pole-analysis-selection/pole-analysis-selection.component';
import { LinesOnPoleSelectionComponent } from './pages/stop/lines-on-pole-selection/lines-on-pole-selection.component';
import { DirectionMeanlatencySettingsComponent } from './pages/line/direction-meanlatency-settings/direction-meanlatency-settings.component';
import { WrongRouteScreenComponent } from './components/wrong-route-screen/wrong-route-screen.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';

export const routes: Routes = [
    { 
        path: '', component: WelcomeScreenComponent,
    },
    {
        path: 'about', component: AboutUsComponent,
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
        path: '**', pathMatch: 'full', component: WrongRouteScreenComponent,
    },   
];

