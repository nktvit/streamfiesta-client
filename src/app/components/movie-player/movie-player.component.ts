import {Component, inject, input, OnChanges} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-movie-player',
  imports: [],
  templateUrl: `./movie-player.component.html`,
  styleUrl: './movie-player.component.css'
})
export class MoviePlayerComponent implements OnChanges {
  readonly imdbId = input<string>('');
  readonly type = input<string>('movie');
  readonly season = input<number | null>(null);
  readonly episode = input<number | null>(null);

  safeEmbedUrl: SafeResourceUrl | null = null;

  private sanitizer = inject(DomSanitizer);

  ngOnChanges() {
    this.safeEmbedUrl = this.createSafeEmbedUrl();
  }

  private createSafeEmbedUrl(): SafeResourceUrl | null {
    if (!this.imdbId()) {
      return null;
    }

    // TODO: replace with a better player
    // example of url: https://www.NontonGo.win/embed/movie/tt0111161
    // const baseUrl = 'http://localhost:3000/https://www.NontonGo.win/embed';

    const baseUrl = 'https://vidsrc.me/embed';
    let embedUrl = `${baseUrl}/${this.type()}/${this.imdbId()}`;

    const s = this.season();
    const e = this.episode();
    if (this.type() === 'tv' && s && e) {
      embedUrl += `/${s}/${e}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }
}
