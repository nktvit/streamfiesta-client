import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { IMovie } from '../interfaces/movie.interface';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  getTrending(): Observable<IMovie[]> {
    return this.fetchList('trending');
  }

  getNowPlaying(): Observable<IMovie[]> {
    return this.fetchList('now_playing');
  }

  getPopular(): Observable<IMovie[]> {
    return this.fetchList('popular');
  }

  getTopRated(): Observable<IMovie[]> {
    return this.fetchList('top_rated');
  }

  getTrendingTV(): Observable<IMovie[]> {
    return this.fetchList('trending_tv');
  }

  getRecommendations(tmdbId: number): Observable<IMovie[]> {
    if (environment.production) {
      return this.http.get<any>(`/api/tmdb?list=recommendations&id=${tmdbId}`).pipe(
        map(res => res.movies || []),
        catchError(() => of([]))
      );
    }

    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/recommendations?api_key=${(environment as any).TMDB_API_KEY}&language=en-US&page=1`;
    return this.http.get<any>(url).pipe(
      map(res => (res.results || [])
        .filter((item: any) => item.vote_count > 50)
        .map((item: any) => this.mapMovie(item))),
      catchError(() => of([]))
    );
  }

  getImdbId(tmdbId: number): Observable<string> {
    if (environment.production) {
      return this.http.get<any>(`/api/tmdb?list=movie&id=${tmdbId}`).pipe(
        map(res => res.imdbID || ''),
        catchError(() => of(''))
      );
    }

    return this.http.get<any>(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${(environment as any).TMDB_API_KEY}`
    ).pipe(
      map(res => res.imdb_id || ''),
      catchError(() => of(''))
    );
  }

  private fetchList(list: string): Observable<IMovie[]> {
    if (environment.production) {
      return this.http.get<any>(`/api/tmdb?list=${list}`).pipe(
        map(res => res.movies || []),
        catchError(err => {
          this.logger.error(`Failed to fetch TMDB ${list}:`, err);
          return of([]);
        })
      );
    }

    const endpoints: Record<string, string> = {
      trending: '/trending/movie/week',
      now_playing: '/movie/now_playing',
      popular: '/movie/popular',
      top_rated: '/movie/top_rated',
      trending_tv: '/trending/tv/week',
    };

    const url = `https://api.themoviedb.org/3${endpoints[list]}?api_key=${(environment as any).TMDB_API_KEY}&language=en-US&page=1`;
    return this.http.get<any>(url).pipe(
      map(res => (res.results || [])
        .filter((item: any) => item.original_language !== 'ru' && item.vote_count > 100)
        .map((item: any) => this.mapMovie(item))),
      catchError(err => {
        this.logger.error(`Failed to fetch TMDB ${list}:`, err);
        return of([]);
      })
    );
  }

  private mapMovie(item: any): IMovie {
    return {
      imdbID: '',
      tmdbId: item.id,
      Title: item.title || item.name || '',
      Poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : '',
      Plot: item.overview || '',
      Backdrop: item.backdrop_path ? `${TMDB_BACKDROP_BASE}${item.backdrop_path}` : '',
      Rating: item.vote_average || 0,
      Year: (item.release_date || item.first_air_date || '').substring(0, 4),
    };
  }
}
