import { Component, inject, input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";
import { IMovie } from "../../interfaces/movie.interface";
import { NgOptimizedImage, NgClass } from "@angular/common";
import { LoggerService } from "../../services/logger.service";

@Component({
  selector: 'app-poster',
  imports: [
    RouterLink,
    NgOptimizedImage,
    NgClass
],
  templateUrl: './poster.component.html',
  styleUrl: './poster.component.css'
})
export class PosterComponent {
  readonly movie = input.required<IMovie>();
  readonly size = input<'small' | 'medium' | 'large'>();
  readonly displayTitle = input<boolean>(false);
  readonly priority = input<boolean>(false);

  isLoading = true;
  imageUrl: string = '';
  placeholderUrl: string = '';

  private cdr = inject(ChangeDetectorRef);
  private logger = inject(LoggerService);

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
    this.logger.log('PosterComponent initialized');
    this.updateImageUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('ngOnChanges called', changes);
    if (changes['movie']) {
      this.updateImageUrl();
    }
  }

  updateImageUrl() {
    const movie = this.movie();
    this.logger.log('updateImageUrl called', movie);
    if (movie && movie.Poster && movie.Poster !== 'N/A') {
      this.imageUrl = movie.Poster;
      this.logger.log('Using movie poster URL:', this.imageUrl);
    } else {
      this.placeholderUrl = this.getPlaceholderUrl();
      this.logger.log('Using placeholder URL:', this.placeholderUrl);
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
