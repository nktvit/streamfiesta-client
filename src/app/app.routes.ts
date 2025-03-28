import {RouterModule, Routes} from '@angular/router'
import {MainComponent} from './pages/main/main.component'
import {SearchPageComponent} from './pages/search-page/search-page.component'
import {MoviePageComponent} from './pages/movie-page/movie-page.component'
import {AboutComponent} from './pages/about/about.component'
import {DonationsComponent} from "./pages/donations/donations.component"
import {NgModule} from "@angular/core"
import {SignInComponent} from "./pages/auth/signin/signin.component"
import {SignUpComponent} from "./pages/auth/signup/signup.component"
import {ProfileComponent} from "./pages/profile/profile.component"
import {AuthGuard} from "./guards/auth.guard"
import {VerifyComponent} from "./pages/auth/verify/verify.component"
import {WatchlistComponent} from "./pages/watchlist/watchlist.component"

export const routes: Routes = [
  {path: "", component: MainComponent, data: {mode: 'home'}},
  {path: 'search', component: SearchPageComponent, data: {mode: 'search'}},
  {path: 'about', component: AboutComponent},
  {path: 'donations', component: DonationsComponent},
  {path: "movie/:id", component: MoviePageComponent},

  // Auth routes
  {path: 'signin', component: SignInComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthGuard]},

  {path: 'verify', component: VerifyComponent},
  {path: 'watchlist', component: WatchlistComponent, canActivate: [AuthGuard]},

  // Angular router's navigation strategy
  {path: '**', redirectTo: 'profile', pathMatch: 'full'},
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
