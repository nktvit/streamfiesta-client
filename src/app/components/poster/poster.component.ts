import {
  Component,
  Input,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import {RouterLink} from '@angular/router';
import {IMovie} from '../../interfaces/movie.interface';
import {NgOptimizedImage, NgClass, NgIf, AsyncPipe} from '@angular/common';
import {LoggerService} from '../../services/logger.service';
import {UserService} from '../../services/user.service';
import {AuthService} from '../../services/auth.service';
import {combineLatest, distinctUntilChanged, EMPTY, map, Subject, Subscription, takeUntil} from 'rxjs';
import {catchError, switchMap, take} from 'rxjs/operators';

@Component({
  selector: 'app-poster',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, NgClass, NgIf, AsyncPipe],
  templateUrl: './poster.component.html',
  styleUrl: './poster.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosterComponent implements OnInit, OnDestroy {
  @Input() movie!: IMovie;
  @Input() size: 'small' | 'medium' | 'large' | undefined;
  @Input() displayTitle: boolean = false;

  isLoading = true;
  imageUrl: string = '';
  placeholderUrl: string = '';
  isInWatchlist = false;
  isAddingToWatchlist = false;

  private watchlistStateSubscription?: Subscription;

  private destroy$ = new Subject<void>();
  private movieId: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
    private userService: UserService,
    public auth: AuthService
  ) {
  }

  ngOnInit() {
    this.updateImageUrl();
    this.movieId = this.movie.imdbID;
    this.initializeWatchlistState();
  }

  ngOnDestroy() {
    this.watchlistStateSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeWatchlistState(): void {
    this.watchlistStateSubscription = combineLatest([
      this.auth.isAuthenticated$(),
      this.userService.watchlist$
    ]).pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged((prev, curr) =>
        prev[0] === curr[0] &&
        JSON.stringify(prev[1]) === JSON.stringify(curr[1])
      ),
      map(([isAuthenticated, watchlist]) => {
        if (!isAuthenticated) return false;
        return watchlist.includes(this.movieId);
      })
    ).subscribe(isInList => {
      if (this.isInWatchlist !== isInList) {
        this.isInWatchlist = isInList;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Toggle the movie in the user's watchlist.
   * @param event
   */
  toggleWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isAddingToWatchlist) return;

    this.isAddingToWatchlist = true;

    this.auth.isAuthenticated$().pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (!isAuthenticated) {
          this.auth.login();
          return EMPTY;
        }

        return this.isInWatchlist
          ? this.userService.removeFromWatchlist(this.movieId)
          : this.userService.addToWatchlist(this.movieId);
      })
    ).subscribe({
      next: () => {
        this.isAddingToWatchlist = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.logger.error('Error updating watchlist:', error);
        this.isAddingToWatchlist = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Get the placeholder URL for the movie poster.
   * @returns The placeholder URL.
   */
  private getPlaceholderUrl(): string {
    const title = this.movie?.Title || 'No Title';
    const words = title.split(' ');

    if (words.length <= 3) {
      return `https://placehold.co/300x440?text=${encodeURIComponent(title)}&font=roboto`;
    }

    const chunks: string[] = [];
    let currentChunk: string[] = [];

    words.forEach((word, index) => {
      currentChunk.push(word);
      if (currentChunk.length === 3 || index === words.length - 1) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    });

    const formattedTitle = chunks.join('\\n');
    return `https://placehold.co/300x440?text=${encodeURIComponent(formattedTitle)}&font=roboto`;
  }

  /**
   * Update the image URL for the movie poster.
   */
  updateImageUrl(): void {
    this.logger.log('updateImageUrl called', this.movie);
    if (this.movie && this.movie.Poster && this.movie.Poster !== 'N/A') {
      this.imageUrl = this.movie.Poster;
      this.logger.log('Using movie poster URL:', this.imageUrl);
    } else {
      this.placeholderUrl = this.getPlaceholderUrl();
      this.logger.log('Using placeholder URL:', this.placeholderUrl);
    }
    this.cdr.detectChanges();
  }

  /**
   * Get the CSS classes for the poster size.
   * @returns The CSS classes.
   */
  get sizeClasses(): string {
    switch (this.size) {
      case 'small':
        return 'max-w-[150px]';
      case 'large':
        return 'max-w-[300px]';
      case 'medium':
        return 'max-w-[200px]';
      default:
        return '';
    }
  }

  /**
   * Handle the image load event.
   */
  onImageLoad(): void {
    this.logger.log('Image loaded successfully');
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  /**
   * Handle the image error event.
   */
  onImageError(): void {
    this.logger.error('Image failed to load');
    this.imageUrl = '';
    this.placeholderUrl = this.getPlaceholderUrl();
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
