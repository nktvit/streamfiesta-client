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
  loading = true;

  private cdr = inject(ChangeDetectorRef);
  private tmdb = inject(TmdbService);
  private tmdbFetchAttempted = false;

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
      this.tmdb.findByImdbId(movie.imdbID).subscribe(result => {
        if (result?.poster) {
          this.imageUrl = result.poster;
        } else {
          this.loading = false;
        }
        this.cdr.detectChanges();
      });
    } else {
      this.loading = false;
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

  onImageLoad() {
    this.loading = false;
    this.cdr.detectChanges();
  }

  onImageError() {
    this.imageUrl = '';
    this.loading = false;
    this.cdr.detectChanges();
  }
}
