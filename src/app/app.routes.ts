import {Routes} from '@angular/router'
import {MainComponent} from './pages/main/main.component'
import {SearchPageComponent} from './pages/search-page/search-page.component'
import {MoviePageComponent} from './pages/movie-page/movie-page.component'
import {AboutComponent} from './pages/about/about.component'
import {GenreComponent} from './pages/genre/genre.component'
import {TopRatedComponent} from './pages/top-rated/top-rated.component'
import {TvComponent} from './pages/tv/tv.component'

export const routes: Routes = [
  {path: "", component: MainComponent, data: {mode: 'home'}},
  {path: 'search', component: SearchPageComponent, data: {mode: 'search'}},
  {path: 'about', component: AboutComponent},
  {path: "movie/:id", component: MoviePageComponent},
  {path: 'genre/:id', component: GenreComponent},
  {path: 'top-rated', component: TopRatedComponent},
  {path: 'tv', component: TvComponent},

  // Angular router's navigation strategy
  {path: '**', redirectTo: '', pathMatch: 'full'},
]
