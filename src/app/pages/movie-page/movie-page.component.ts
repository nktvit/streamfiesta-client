import {Component, inject} from '@angular/core';
import {MovieService} from '../../services/movie.service';
import {ActivatedRoute, Router} from '@angular/router';
import { NgClass } from '@angular/common';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {BackButtonComponent} from '../../components/back-button/back-button.component';
import {MoviePlayerComponent} from "../../components/movie-player/movie-player.component";
import {catchError, of, switchMap, tap} from "rxjs";
import {PosterComponent} from "../../components/poster/poster.component";
import {LoggerService} from "../../services/logger.service";
import {TmdbService} from "../../services/tmdb.service";
import {IMovie} from "../../interfaces/movie.interface";
import {AdguardPromptComponent} from "../../components/adguard-prompt/adguard-prompt.component";

interface EpisodeInfo {
  number: number;
  title: string;
  rating: string | null;
  airDate: string | null;
}

@Component({
  selector: 'app-movie-page',
  imports: [NavbarComponent, BackButtonComponent, NgClass, MoviePlayerComponent, PosterComponent, AdguardPromptComponent],
  templateUrl: './movie-page.component.html',
  styleUrl: './movie-page.component.css'
})
export class MoviePageComponent {
  isLoading = true;
  invalidResponse: boolean = false;
  isFullPlot = false;
  shouldClamp = false;
  isPlotLong = false;
  adjustedPlot = '';
  movieId: string = "";
  movieDetails: any = {};
  movieDetailsArray: any[] = [];
  protected type: string = 'movie';
  protected imdbId: any;
  protected season: number | null = null;
  protected episode: number | null = null;
  protected totalSeasons: number = 0;
  protected seasonNumbers: number[] = [];
  protected episodes: EpisodeInfo[] = [];
  protected loadingEpisodes = false;
  protected recommendations: IMovie[] = [];
  protected seasonNames: Map<number, string> = new Map();
  private originalRouteId: string = '';
  private tmdbId: number | null = null;

  private movieService = inject(MovieService);
  private tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private logger = inject(LoggerService);

  ngOnInit() {
    this.isLoading = true;

    this.route.queryParams.subscribe(params => {
      this.season = params['s'] ? +params['s'] : null;
      this.episode = params['e'] ? +params['e'] : null;
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id === null) return of(null);

        // Reset state for new movie
        this.isLoading = true;
        this.invalidResponse = false;
        this.movieDetails = {};
        this.movieDetailsArray = [];
        this.adjustedPlot = '';
        this.isFullPlot = false;
        this.imdbId = null;
        this.type = 'movie';
        this.season = null;
        this.episode = null;
        this.totalSeasons = 0;
        this.seasonNumbers = [];
        this.episodes = [];
        this.recommendations = [];
        this.originalRouteId = id;
        window.scrollTo({ top: 0 });

        // If numeric ID, it's a TMDB ID — resolve to IMDB ID and redirect
        if (/^\d+$/.test(id)) {
          const tmdbId = +id;
          this.tmdbService.getImdbId(tmdbId).subscribe(imdbId => {
            if (imdbId) {
              this.router.navigate(['/movie', imdbId], {
                replaceUrl: true,
                queryParams: { tmdb: tmdbId },
                queryParamsHandling: 'merge',
              });
            } else {
              this.invalidResponse = true;
              this.isLoading = false;
            }
          });
          return of(null);
        }

        // Standard IMDB ID
        this.movieId = id;
        return this.movieService.getMovieDetails(id).pipe(
          catchError(error => {
            this.logger.error('Error fetching movie details: ', error);
            this.invalidResponse = true;
            return of(null);
          })
        );
      }),
      tap(details => {
        if (details === null) return; // Skip — either redirecting or no data yet
        if (details) {
          this.invalidResponse = false;
          this.movieDetails = details;
          this.logger.log('Movie details: ', details);

          if (details.Plot && details.Plot !== 'N/A') {
            this.adjustedPlot = this.adjustPlot(details.Plot);
            this.isPlotLong = this.adjustedPlot.length > 300;
            this.shouldClamp = !this.isFullPlot && this.isPlotLong;
          }

          this.movieDetailsArray = this.movieService.formatMovieDetailsArray(details);
          this.imdbId = this.movieService.getImdbId(details);
          this.type = this.movieService.getMediaType(details);

          if (this.type === 'tv') {
            if (!this.season) this.season = 1;
            if (!this.episode) this.episode = 1;
            this.resolveTmdbId();
          }
        }
        this.isLoading = false;
        this.loadRecommendations();
      })
    ).subscribe();
  }

  private loadRecommendations() {
    const tmdbParam = this.route.snapshot.queryParams['tmdb'];
    const tmdbId = tmdbParam ? +tmdbParam : (/^\d+$/.test(this.originalRouteId) ? +this.originalRouteId : null);

    if (tmdbId) {
      this.fetchRecommendations(tmdbId);
    } else if (this.imdbId) {
      // Resolve TMDB ID from IMDB ID
      this.tmdbService.findTmdbId(this.imdbId).subscribe(id => {
        if (id) this.fetchRecommendations(id);
      });
    }
  }

  private fetchRecommendations(tmdbId: number) {
    this.tmdbService.getRecommendations(tmdbId, this.type).subscribe(movies => {
      this.recommendations = movies.slice(0, 15);
    });
  }

  private resolveTmdbId() {
    const tmdbParam = this.route.snapshot.queryParams['tmdb'];
    this.tmdbId = tmdbParam ? +tmdbParam : (/^\d+$/.test(this.originalRouteId) ? +this.originalRouteId : null);

    if (this.tmdbId) {
      // Use TMDB for season/episode data (more accurate, especially for anime)
      this.tmdbService.getTVDetails(this.tmdbId).subscribe(details => {
        this.totalSeasons = details.totalSeasons;
        this.seasonNumbers = details.seasons.map(s => s.number);
        details.seasons.forEach(s => this.seasonNames.set(s.number, s.name));
        this.loadEpisodes(this.season!);
      });
    } else {
      // Fall back to OMDB
      const omdbSeasons = this.movieDetails.totalSeasons;
      if (omdbSeasons && omdbSeasons !== 'N/A') {
        this.totalSeasons = +omdbSeasons;
        this.seasonNumbers = Array.from({length: this.totalSeasons}, (_, i) => i + 1);
        this.loadEpisodes(this.season!);
      }
    }
  }

  loadEpisodes(season: number) {
    this.loadingEpisodes = true;

    if (this.tmdbId) {
      // TMDB episodes
      this.tmdbService.getTVSeasonEpisodes(this.tmdbId, season).subscribe(episodes => {
        this.episodes = episodes;
        this.loadingEpisodes = false;
      });
    } else {
      // OMDB episodes (fallback)
      this.movieService.getSeasonEpisodes(this.imdbId, season).subscribe(episodes => {
        this.episodes = episodes.map((ep: any) => ({
          number: +ep.Episode,
          title: ep.Title,
          rating: ep.imdbRating !== 'N/A' ? ep.imdbRating : null,
          airDate: ep.Released !== 'N/A' ? ep.Released : null,
        }));
        this.loadingEpisodes = false;
      });
    }
  }

  goToEpisode(season: number, episode: number) {
    if (episode < 1) episode = 1;
    if (this.episodes.length > 0 && episode > this.episodes.length) {
      episode = this.episodes.length;
    }
    this.season = season;
    this.episode = episode;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {s: season, e: episode},
      queryParamsHandling: 'merge',
    });
  }

  prevEpisode() {
    if (this.episode && this.episode > 1) {
      this.goToEpisode(this.season!, this.episode - 1);
    }
  }

  nextEpisode() {
    if (this.episode && this.episodes.length > 0 && this.episode >= this.episodes.length) return;
    this.goToEpisode(this.season!, (this.episode || 0) + 1);
  }

  onSeasonChange(seasonNum: number) {
    this.loadEpisodes(seasonNum);
    this.goToEpisode(seasonNum, 1);
  }

  togglePlot() {
    this.isFullPlot = !this.isFullPlot;
    this.shouldClamp = !this.isFullPlot && this.isPlotLong;
  }

  adjustPlot(plot: string): string {
    if (!plot || plot === 'N/A') {
      return '';
    }
    return plot.trim().replace(/,\s*$/, '');
  }
}
