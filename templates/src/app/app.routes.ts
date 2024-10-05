import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { SearchComponent } from './components/search/search.component';
import { ResultsComponent } from './components/results/results.component';
import { DirectionSelectionComponent } from './components/direction-selection/direction-selection.component';
import { PoleSelectionComponent } from './components/pole-selection/pole-selection.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    { path: 'search', component: SearchComponent },
    {
        path: 'line/:line', component: DirectionSelectionComponent,
            children: [
                {
                    path: ':direction', redirectTo: '', //component: futurecomponent
                    children: [
                        {
                            path: 'real_schedule', redirectTo: '', //component: futurecomponent
                            children: [
                                {
                                    path: 'settings', redirectTo: '', //component: futurecomponent
                                },
                                {
                                    path: 'results', redirectTo: '', //component: futurecomponent
                                },
                            ],
                        },
                        {
                            path: 'mean_latency', redirectTo: '', //component: futurecomponent
                            children: [
                                {
                                    path: 'settings', redirectTo: '', //component: futurecomponent
                                },
                                {
                                    path: 'results', redirectTo: '', //component: futurecomponent
                                },
                            ],
                        },
                    ]
                },
            ]
    },
    {
        path: 'stop/:stopName/:stopId', component: PoleSelectionComponent,
            children: [
                {
                    path: ':poleNumber', redirectTo: '', //component: futurecomponent
                    children: [
                        {
                            path: 'real_schedule', redirectTo: '', //component: futurecomponent
                            children: [
                                {
                                    path: 'settings', redirectTo: '', //component: futurecomponent
                                },
                                {
                                    path: 'results', redirectTo: '', //component: futurecomponent
                                },
                            ],
                        },
                        {
                            path: 'lines', redirectTo: '', //component: futurecomponent
                        },
                    ]
                },
            ]

    },
    //THIS PATH IS HERE TEMPORARLY 
    { path: 'results/:line/:directionSwapped/:startStop/:endStop', component: ResultsComponent },  //TODO is there a more elegant way to construct this url parameters?
];
