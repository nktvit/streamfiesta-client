import { Routes } from '@angular/router';
import { MainComponent } from './pages/main/main.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { MoviePageComponent } from './pages/movie-page/movie-page.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
    {path: "", component: MainComponent, data: { mode: 'home' } },
    {path: 'search', component: SearchPageComponent, data: { mode: 'search' } },
    {path: 'about', component: AboutComponent},
    {path: "movie/:id", component: MoviePageComponent},

];
