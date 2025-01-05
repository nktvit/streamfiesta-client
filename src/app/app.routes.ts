import {Routes} from '@angular/router';
import {MainComponent} from './pages/main/main.component';
import {SearchPageComponent} from './pages/search-page/search-page.component';
import {MoviePageComponent} from './pages/movie-page/movie-page.component';
import {AboutComponent} from './pages/about/about.component';
import {DonationsComponent} from "./pages/donations/donations.component";
import {FavoritesComponent} from "./pages/favorites/favorites.component";
import {AuthGuard} from "@auth0/auth0-angular";
import {ProfileComponent} from "./pages/profile/profile.component";

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
    path: 'search',
    component: SearchPageComponent,
    data: {mode: 'search'}
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'wishlist',
    component: FavoritesComponent,
    canActivate: [AuthGuard]
  },
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
