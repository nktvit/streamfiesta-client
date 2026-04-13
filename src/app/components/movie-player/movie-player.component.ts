import {Component, inject, input, OnChanges} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

interface PlayerSource {
  name: string;
  buildUrl: (type: string, id: string, season: number | null, episode: number | null) => string;
}

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
  activePlayer = 0;

  readonly players: PlayerSource[] = [
    {
      name: 'Server 1',
      buildUrl: (type, id, s, e) => {
        let url = `https://vidsrc-embed.ru/embed/${type}/${id}`;
        if (type === 'tv' && s && e) url += `/${s}-${e}`;
        return url;
      }
    },
    {
      name: 'Server 2',
      buildUrl: (type, id, s, e) => {
        let url = `https://vidsrc.xyz/embed/${type}/${id}`;
        if (type === 'tv' && s && e) url += `/${s}-${e}`;
        return url;
      }
    },
    {
      name: 'Server 3',
      buildUrl: (type, id, s, e) => {
        let url = `https://www.NontonGo.win/embed/${type === 'tv' ? 'tv' : 'movie'}/${id}`;
        if (type === 'tv' && s && e) url += `/${s}/${e}`;
        return url;
      }
    },
  ];

  private sanitizer = inject(DomSanitizer);

  ngOnChanges() {
    this.safeEmbedUrl = this.buildUrl();
  }

  switchPlayer(index: number) {
    this.activePlayer = index;
    this.safeEmbedUrl = this.buildUrl();
  }

  private buildUrl(): SafeResourceUrl | null {
    if (!this.imdbId()) return null;
    const type = this.type() === 'tv' ? 'tv' : 'movie';
    const url = this.players[this.activePlayer].buildUrl(
      type, this.imdbId(), this.season(), this.episode()
    );
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
