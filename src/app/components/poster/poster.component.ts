import { Component, inject, input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";
import { IMovie } from "../../interfaces/movie.interface";
import { NgOptimizedImage } from "@angular/common";
import { TmdbService } from "../../services/tmdb.service";

@Component({
  selector: 'app-poster',
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './poster.component.html',
  styleUrl: './poster.component.css'
})
export class PosterComponent {
  readonly movie = input.required<IMovie>();
  readonly size = input<'small' | 'medium' | 'large'>();
  readonly displayTitle = input<boolean>(false);
  readonly priority = input<boolean>(false);

  imageUrl = '';
  placeholderUrl = '';

  private cdr = inject(ChangeDetectorRef);
  private tmdb = inject(TmdbService);
  private tmdbFetchAttempted = false;

  private getPlaceholderUrl(): string {
    const title = this.movie()?.Title || 'No Title';
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
    this.updateImageUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['movie']) {
      this.tmdbFetchAttempted = false;
      this.updateImageUrl();
    }
  }

  updateImageUrl() {
    const movie = this.movie();
    if (movie && movie.Poster && movie.Poster !== 'N/A') {
      this.imageUrl = movie.Poster;
    } else if (!this.tmdbFetchAttempted && movie?.imdbID) {
      this.tmdbFetchAttempted = true;
      this.placeholderUrl = this.getPlaceholderUrl();
      this.tmdb.findByImdbId(movie.imdbID).subscribe(result => {
        if (result?.poster) {
          this.imageUrl = result.poster;
          this.placeholderUrl = '';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.placeholderUrl = this.getPlaceholderUrl();
    }
    this.cdr.detectChanges();
  }

  get sizeClasses(): string {
    switch (this.size()) {
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

  onImageError() {
    this.imageUrl = '';
    this.placeholderUrl = this.getPlaceholderUrl();
    this.cdr.detectChanges();
  }
}
