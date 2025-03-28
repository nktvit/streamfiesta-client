import { Component, Input, ChangeDetectorRef, OnInit, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { IMovie } from "../../interfaces/movie.interface";
import { NgOptimizedImage, NgClass, NgIf } from "@angular/common";
import { LoggerService } from "../../services/logger.service";
import { WatchlistService, WatchStatus } from "../../services/watchlist.service";
import {PbManagerService} from "../../services/pbmanager.service"

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
  @Input() showWatchlistButton: boolean = true;

  isLoading = true;
  imageUrl: string = '';
  placeholderUrl: string = '';
  isInWatchlist = false;
  addingToWatchlist = false;

  // Define WatchStatus for template usage
  WatchStatus = WatchStatus;
  currentStatus: WatchStatus = WatchStatus.NOT_WATCHED;

  constructor(
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
    private watchlistService: WatchlistService,
    public pbManager: PbManagerService
  ) {}

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

  ngOnInit() {
    this.logger.log('PosterComponent initialized');
    this.updateImageUrl();
    this.checkWatchlistStatus();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('ngOnChanges called', changes);
    if (changes['movie']) {
      this.updateImageUrl();
      this.checkWatchlistStatus();
    }
  }

  /**
   * Check if this movie is in the user's watchlist
   */
  private checkWatchlistStatus() {
    if (!this.pbManager.isAuthenticated) {
      this.isInWatchlist = false;
      return;
    }

    const watchlistItem = this.watchlistService.getWatchlistItem(this.movie.imdbID);
    this.isInWatchlist = !!watchlistItem;

    if (watchlistItem) {
      this.currentStatus = watchlistItem.status;
    } else {
      this.currentStatus = WatchStatus.NOT_WATCHED;
    }
  }

  /**
   * Toggle watchlist status for this movie
   */
  async toggleWatchlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.pbManager.isAuthenticated) {
      // Could show a message or redirect to login
      return;
    }

    this.addingToWatchlist = true;

    try {
      if (this.isInWatchlist) {
        await this.watchlistService.removeFromWatchlist(this.movie.imdbID);
        this.isInWatchlist = false;
      } else {
        await this.watchlistService.addToWatchlist(
          this.movie.imdbID,
          WatchStatus.NOT_WATCHED
        );
        this.isInWatchlist = true;
      }
      this.checkWatchlistStatus();
    } catch (error) {
      this.logger.error('Error updating watchlist:', error);
    } finally {
      this.addingToWatchlist = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Update watchlist status for this movie
   */
  async updateWatchStatus(event: Event, status: WatchStatus) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.pbManager.isAuthenticated) {
      return;
    }

    this.addingToWatchlist = true;

    try {
      const watchlistItem = this.watchlistService.getWatchlistItem(this.movie.imdbID);

      if (watchlistItem) {
        // Update existing item
        await this.watchlistService.updateStatus(this.movie.imdbID, status);
      } else {
        // Add new item with specified status
        await this.watchlistService.addToWatchlist(
          this.movie.imdbID,
          status
        );
      }

      this.currentStatus = status;
      this.isInWatchlist = true;
      this.checkWatchlistStatus();
    } catch (error) {
      this.logger.error('Error updating watch status:', error);
    } finally {
      this.addingToWatchlist = false;
      this.cdr.detectChanges();
    }
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
