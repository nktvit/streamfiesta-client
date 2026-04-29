import {Component, inject, input, output, OnChanges, SimpleChanges} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

const PROXY_ORIGIN = 'https://media.fiesta.show';
const PROXIED_HOSTS = new Set(['vidsrc.me']);

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
  readonly server = input<number>(0);
  readonly serverChange = output<number>();

  safeEmbedUrl: SafeResourceUrl | null = null;
  activePlayer = 0;

  readonly players: PlayerSource[] = [
    {
      name: 'Server 1',
      buildUrl: (type, id, s, e) => {
        let url = `https://vidsrc.me/embed/${type}/${id}`;
        if (type === 'tv' && s && e) url += `/${s}-${e}`;
        return url;
      }
    },
    {
      name: 'Server 2',
      buildUrl: (type, id, s, e) => {
        let url = `https://vsembed.ru/embed/${type}/${id}`;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['server']) {
      this.activePlayer = this.server();
    }
    this.safeEmbedUrl = this.buildUrl();
  }

  switchPlayer(index: number) {
    this.activePlayer = index;
    this.safeEmbedUrl = this.buildUrl();
    this.serverChange.emit(index);
  }

  private buildUrl(): SafeResourceUrl | null {
    if (!this.imdbId()) return null;
    const type = this.type() === 'tv' ? 'tv' : 'movie';
    const url = this.players[this.activePlayer].buildUrl(
      type, this.imdbId(), this.season(), this.episode()
    );
    const isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
    const finalUrl = isSafari ? url : this.toProxy(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  private toProxy(url: string): string {
    try {
      const u = new URL(url);
      const host = u.host.toLowerCase();
      if (!PROXIED_HOSTS.has(host)) return url;
      return `${PROXY_ORIGIN}/${host}${u.pathname}${u.search}`;
    } catch {
      return url;
    }
  }
}
