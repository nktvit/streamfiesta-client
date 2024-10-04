import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
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
export class PosterComponent {
  @Input() movie!: IMovie;
  isLoading = true;
  imageUrl: string | SafeResourceUrl = '';

  constructor(private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.imageUrl = this.getMoviePosterUrl();
  }

  getMoviePosterUrl(): string | SafeResourceUrl {
    if (this.movie.posterUrl !== 'N/A' && this.movie.posterUrl) {
      return this.movie.posterUrl;
    } else {
      const placeholderUrl = `https://placehold.co/300x440?text=${encodeURIComponent(this.movie.title || 'No Title')}`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(placeholderUrl);
    }
  }

  onImageLoad() {
    this.isLoading = false;
    this.cdr.detectChanges(); // Force change detection
  }

  onImageError() {
    this.imageUrl = 'https://placehold.co/300x440?text=Image+Not+Available';
    this.isLoading = false;
    this.cdr.detectChanges(); // Force change detection
  }
}
