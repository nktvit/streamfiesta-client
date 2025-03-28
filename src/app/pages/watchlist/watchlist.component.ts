import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PosterComponent } from '../../components/poster/poster.component';
import { WatchlistService, WatchlistItem, WatchStatus } from '../../services/watchlist.service';
import { LoggerService } from '../../services/logger.service';
import { IMovie } from '../../interfaces/movie.interface';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    PosterComponent,
    RouterLink
  ],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})
export class WatchlistComponent implements OnInit {
  watchlist: WatchlistItem[] = [];
  watchlistWithMovies: (WatchlistItem & { movie?: IMovie })[] = [];
  isLoading = true;

  // For filtering
  filteredWatchlist: (WatchlistItem & { movie?: IMovie })[] = [];
  currentFilter: 'all' | WatchStatus = 'all';

  // For UI display
  WatchStatus = WatchStatus;

  constructor(
    private watchlistService: WatchlistService,
    private movieService: MovieService,
    private logger: LoggerService
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    // Subscribe to watchlist changes
    this.watchlistService.watchlist$.subscribe(watchlist => {
      this.watchlist = watchlist;
      this.fetchMovieDetails(watchlist);
    });

    // Load watchlist
    await this.watchlistService.loadWatchlist();
  }

  /**
   * Fetch movie details for all watchlist items
   */
  fetchMovieDetails(watchlist: WatchlistItem[]) {
    if (watchlist.length === 0) {
      this.watchlistWithMovies = [];
      this.applyFilter(this.currentFilter);
      this.isLoading = false;
      return;
    }

    // Create an array of observables, one for each movie detail request
    const movieRequests = watchlist.map(item => {
      return this.movieService.getMovieDetails(item.imdbID).pipe(
        map(movie => {
          return { ...item, movie };
        }),
        catchError(error => {
          this.logger.error(`Failed to fetch details for movie ${item.imdbID}:`, error);
          // Return the watchlist item without movie details
          return of({ ...item, movie: undefined });
        })
      );
    });

    // Execute all requests in parallel
    forkJoin(movieRequests).subscribe({
      next: results => {
        this.watchlistWithMovies = results.filter(item => item.movie !== undefined);
        this.applyFilter(this.currentFilter);
        this.isLoading = false;
      },
      error: err => {
        this.logger.error('Error fetching movie details:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Apply a filter to the watchlist
   */
  applyFilter(filter: 'all' | WatchStatus) {
    this.currentFilter = filter;

    if (filter === 'all') {
      this.filteredWatchlist = [...this.watchlistWithMovies];
    } else {
      this.filteredWatchlist = this.watchlistWithMovies.filter(item => item.status === filter);
    }
  }

  /**
   * Get human-readable status text
   */
  getStatusText(status: WatchStatus): string {
    switch (status) {
      case WatchStatus.NOT_WATCHED:
        return 'Not Watched';
      case WatchStatus.IN_PROGRESS:
        return 'In Progress';
      case WatchStatus.WATCHED:
        return 'Watched';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get watchlist length by status
   */
  getCountByStatus(status: WatchStatus): number {
    return this.watchlist.filter(item => item.status === status).length;
  }
}
