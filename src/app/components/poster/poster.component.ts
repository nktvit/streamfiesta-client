import {Component, Input, ChangeDetectorRef, OnInit, SimpleChanges} from '@angular/core';
import {RouterLink} from "@angular/router";
import {DomSanitizer} from "@angular/platform-browser";
import {IMovie} from "../../interfaces/movie.interface";
import {NgOptimizedImage, NgClass, NgIf} from "@angular/common";
import {LoggerService} from "../../services/logger.service";
import {FavoriteMovieService} from "../../services/favorite-movie.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-poster',
  standalone: true,
  imports: [
    RouterLink,
    NgOptimizedImage,
    NgClass,
    NgIf
  ],
  templateUrl: './poster.component.html',
  styleUrl: './poster.component.css'
})
export class PosterComponent implements OnInit {
  @Input() movie!: IMovie;
  @Input() size: 'small' | 'medium' | 'large' | undefined;
  @Input() displayTitle: boolean = false;

  isLoading = true;
  imageUrl: string = '';
  placeholderUrl: string = '';
  isInWishlist = false;
  isAddingToWishlist = false;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
    private favoriteMovieService: FavoriteMovieService,
    public authService: AuthService
  ) {
  }

  ngOnInit() {
    this.logger.log('PosterComponent initialized');
    this.updateImageUrl();
    this.checkWishlistStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('ngOnChanges called', changes);
    if (changes['movie']) {
      this.updateImageUrl();
      this.checkWishlistStatus();
    }
  }

  checkWishlistStatus() {
    if (this.authService.isLoggedIn()) {
      this.favoriteMovieService.getFavorites().subscribe({
        next: (favorites: any[]) => {
          this.isInWishlist = favorites.some(fav => fav.imdbId === this.movie.imdbID);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.logger.error('Error checking wishlist status:', error);
        }
      });
    }
  }

  toggleWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isAddingToWishlist) return;

    this.isAddingToWishlist = true;

    if (this.isInWishlist) {
      // Find the favorite movie ID first
      this.favoriteMovieService.getFavorites().subscribe({
        next: (favorites: any[]) => {
          const favorite = favorites.find(fav => fav.imdbId === this.movie.imdbID);
          if (favorite) {
            this.favoriteMovieService.removeFromFavorites(favorite._id).subscribe({
              next: () => {
                this.isInWishlist = false;
                this.isAddingToWishlist = false;
                this.cdr.detectChanges();
              },
              error: (error: any) => {
                this.logger.error('Error removing from wishlist:', error);
                this.isAddingToWishlist = false;
                this.cdr.detectChanges();
              }
            });
          }
        }
      });
    } else {
      this.favoriteMovieService.addToFavorites({
        imdbId: this.movie.imdbID,
        title: this.movie.Title
      }).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.isAddingToWishlist = false;
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          this.logger.error('Error adding to wishlist:', error);
          this.isAddingToWishlist = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

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

  updateImageUrl() {
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

  onImageLoad() {
    this.logger.log('Image loaded successfully');
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  onImageError() {
    this.logger.error('Image failed to load');
    this.imageUrl = '';
    this.placeholderUrl = this.getPlaceholderUrl();
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
