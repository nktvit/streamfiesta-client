import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';

export const routes: Routes = [
    {path: "", component: MainComponent, data: { mode: 'home' } },
    {path: 'search', component: SearchPageComponent, data: { mode: 'search' } }
];
