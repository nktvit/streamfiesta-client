import { Component, Input, ChangeDetectorRef, OnInit, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { IMovie } from "../../interfaces/IMovie";
import { NgOptimizedImage, NgClass, NgIf } from "@angular/common";
import {LoggerService} from "../../services/logger.service";

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

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef, private logger: LoggerService) {}

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
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('ngOnChanges called', changes);
    if (changes['movie']) {
      this.updateImageUrl();
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
