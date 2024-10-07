import { Component, Input, ChangeDetectorRef, OnInit, SimpleChanges } from '@angular/core';
import { RouterLink } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { IMovie } from "../../interfaces/IMovie";
import { NgOptimizedImage, NgClass, NgIf } from "@angular/common";

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

  isLoading = true;
  imageUrl: string = '';
  placeholderUrl: string = '';

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('PosterComponent initialized');
    this.updateImageUrl();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges called', changes);
    if (changes['movie']) {
      this.updateImageUrl();
    }
  }

  updateImageUrl() {
    console.log('updateImageUrl called', this.movie);
    if (this.movie && this.movie.Poster && this.movie.Poster !== 'N/A') {
      this.imageUrl = this.movie.Poster;
      console.log('Using movie poster URL:', this.imageUrl);
    } else {
      this.placeholderUrl = `https://placehold.co/300x440?text=${encodeURIComponent(this.movie?.title || 'No Title')}`;
      console.log('Using placeholder URL:', this.placeholderUrl);
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
    console.log('Image loaded successfully');
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  onImageError() {
    console.error('Image failed to load');
    this.imageUrl = '';
    this.placeholderUrl = 'https://placehold.co/300x440?text=Image+Not+Available';
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
