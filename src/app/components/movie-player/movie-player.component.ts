import {Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-movie-player',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: `./movie-player.component.html`,
  styleUrl: './movie-player.component.css'
})
export class MoviePlayerComponent implements OnChanges {
  @Input() imdbId: string = '';
  @Input() type: string = 'movie';
  @ViewChild('iframe') iframeRef!: ElementRef<HTMLIFrameElement>;

  safeEmbedUrl: SafeResourceUrl | null = null;
  isPlaying: boolean = false;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnChanges() {
    this.safeEmbedUrl = this.createSafeEmbedUrl();
  }

  private createSafeEmbedUrl(): SafeResourceUrl | null {
    if (!this.imdbId) {
      return null;
    }

    const baseUrl = 'https://vidsrc.to/embed';
    const embedUrl = `${baseUrl}/${this.type}/${this.imdbId}`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}

