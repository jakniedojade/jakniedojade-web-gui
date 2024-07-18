import { Routes } from '@angular/router';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { LineSelectionComponent } from './line-selection/line-selection.component';
import { SideMenuStepsComponent } from './side-menu-steps/side-menu-steps.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';

export const routes: Routes = [
    { path: '', component: WelcomeScreenComponent },
    {
        path: 'analyze',
        component: SideMenuStepsComponent,
        children: [
            { path: 'lines', component: LineSelectionComponent },
            { path: ':line', component: PlaceholderComponent },
            { 
                path: 'results', 
                component: PlaceholderComponent,
                children: [
                    { path: ':line', component: PlaceholderComponent },
                ]
            },
        ]
    },
];
