import {RouterModule, Routes} from '@angular/router';
import {MainComponent} from './pages/main/main.component';
import {SearchPageComponent} from './pages/search-page/search-page.component';
import {MoviePageComponent} from './pages/movie-page/movie-page.component';
import {AboutComponent} from './pages/about/about.component';
import {DonationsComponent} from "./pages/donations/donations.component";
import {NgModule} from "@angular/core";

export const routes: Routes = [
  {path: "", component: MainComponent, data: {mode: 'home'}},
  {path: 'search', component: SearchPageComponent, data: {mode: 'search'}},
  {path: 'about', component: AboutComponent},
  {path: 'donations', component: DonationsComponent},
  {path: "movie/:id", component: MoviePageComponent},
  // Angular router's navigation strategy
  { path: '**', redirectTo: '/search', pathMatch: 'full' },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
