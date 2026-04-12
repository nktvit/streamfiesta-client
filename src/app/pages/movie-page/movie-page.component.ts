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

@Component({
  selector: 'app-movie-page',
  imports: [NavbarComponent, BackButtonComponent, NgClass, MoviePlayerComponent, PosterComponent],
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

  private movieService = inject(MovieService);
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
        if (id !== null) {
          this.movieId = id;
          return this.movieService.getMovieDetails(this.movieId).pipe(
            catchError((error) => {
              this.logger.error('Error fetching movie details: ', error);
              this.invalidResponse = true;
              return of(null);
            })
          );
        }
        return of(null);
      }),
      tap(details => {
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

          if (this.type === 'tv' && details.totalSeasons && details.totalSeasons !== 'N/A') {
            this.totalSeasons = +details.totalSeasons;
            this.seasonNumbers = Array.from({length: this.totalSeasons}, (_, i) => i + 1);
            if (!this.season) this.season = 1;
            if (!this.episode) this.episode = 1;
          }
        }
        this.isLoading = false;
      })
    ).subscribe();
  }

  goToEpisode(season: number, episode: number) {
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
    this.goToEpisode(this.season!, (this.episode || 0) + 1);
  }

  onSeasonChange(seasonNum: number) {
    this.goToEpisode(seasonNum, 1);
  }

  togglePlot() {
    this.isFullPlot = !this.isFullPlot;
    this.shouldClamp = !this.isFullPlot && this.isPlotLong;
  }

  adjustPlot(plot: string): string {
    // Remove trailing comma if it exists
    if (!plot || plot === 'N/A') {
      return '';
    }
    return plot.trim().replace(/,\s*$/, '');
  }
}
