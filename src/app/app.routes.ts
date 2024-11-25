import {Routes} from '@angular/router';
import {MainComponent} from './pages/main/main.component';
import {SearchPageComponent} from './pages/search-page/search-page.component';
import {MoviePageComponent} from './pages/movie-page/movie-page.component';
import {AboutComponent} from './pages/about/about.component';
import {DonationsComponent} from "./pages/donations/donations.component";
import {AuthComponent} from "./pages/auth/auth.component";
import {FavoritesComponent} from "./pages/favorites/favorites.component";
import {AuthGuard} from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: 'home',
    component: MainComponent,
    data: {mode: 'home'}
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'search',
    component: SearchPageComponent,
    data: {mode: 'search'}
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'wishlist',
    component: FavoritesComponent,
    canActivate: [AuthGuard]},
  {
    path: 'donations',
    component: DonationsComponent
  },
  {
    path: 'movie/:id',
    component: MoviePageComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
