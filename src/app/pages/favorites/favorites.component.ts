import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from "@angular/router";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {AuthService} from '../../services/auth.service';
import {UserService} from "../../services/user.service";
import {
  BehaviorSubject, catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable, of,
  Subject,
  Subscription, switchMap,
  takeUntil, tap
} from "rxjs";
import {IMovie} from "../../interfaces/movie.interface";
import {MovieService} from "../../services/movie.service";
import {MoviesGridComponent} from "../../components/movies-grid/movies-grid.component";

@Component({
  selector: 'app-favorites',
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    NavbarComponent,
    AsyncPipe,
    MoviesGridComponent
  ],
  templateUrl: './favorites.component.html',
  standalone: true,
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  readonly isLoadingSubject = new BehaviorSubject<boolean>(true);
  readonly errorSubject = new BehaviorSubject<string>('');

  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  movies$: Observable<IMovie[]>;

  constructor(
    private userService: UserService,
    private movieService: MovieService,
    public auth: AuthService
  ) {
    this.movies$ = combineLatest([
      this.auth.isAuthenticated$(),
      this.userService.watchlist$
    ]).pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) =>
        prev[0] === curr[0] &&
        JSON.stringify(prev[1]) === JSON.stringify(curr[1])
      ),
      switchMap(([isAuthenticated, watchlist]) => {
        if (!isAuthenticated) {
          this.errorSubject.next('Please log in to view your watchlist');
          return of([] as IMovie[]);  // Explicitly empty array
        }

        if (!watchlist.length) {
          this.isLoadingSubject.next(false);
          return of([] as IMovie[]);  // Explicitly empty array
        }

        // Fetch movie details for each ID in watchlist
        return combineLatest(
          watchlist.map(movieId =>
            this.movieService.getMovieDetails(movieId).pipe(
              catchError(error => {
                console.error(`Error fetching movie ${movieId}:`, error);
                return of(null);
              })
            )
          )
        ).pipe(
          map(movies => movies.filter((movie): movie is IMovie => movie !== null)),
          tap(() => this.isLoadingSubject.next(false))
        );
      }),
      catchError(error => {
        console.error('Error in watchlist stream:', error);
        this.errorSubject.next('An error occurred while loading your watchlist');
        this.isLoadingSubject.next(false);
        return of([] as IMovie[]);  // Explicitly type the empty array
      })
    );
  }

  ngOnInit() {
    this.userService.getWatchlist().subscribe({
      error: (error) => {
        console.error('Error fetching watchlist:', error);
        this.errorSubject.next('Failed to load watchlist');
        this.isLoadingSubject.next(false);
      }
    });
  }

  ngOnDestroy() {
    this.isLoadingSubject.complete();
    this.errorSubject.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
