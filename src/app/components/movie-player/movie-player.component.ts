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

    const baseUrl = 'https://vidsrc.to/embed/movie';
    const embedUrl = `${baseUrl}/${this.imdbId}`;
    console.log("movie", embedUrl)

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const message = { type: 'playVideo', value: this.isPlaying };
    this.iframeRef.nativeElement.contentWindow?.postMessage(message, 'https://vidsrc.to'); // Be specific about the origin
  }

}

