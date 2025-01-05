import {Component, OnInit} from '@angular/core';
import {MovieService} from '../../services/movie.service';
import {ActivatedRoute} from '@angular/router';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {BackButtonComponent} from '../../components/back-button/back-button.component';
import {MoviePlayerComponent} from "../../components/movie-player/movie-player.component";
import {catchError, of, switchMap, tap} from "rxjs";
import {PosterComponent} from "../../components/poster/poster.component";
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'app-movie-page',
  standalone: true,
  imports: [NgIf, NgFor, NavbarComponent, BackButtonComponent, NgClass, MoviePlayerComponent, PosterComponent],
  templateUrl: './movie-page.component.html',
  styleUrl: './movie-page.component.css'
})
export class MoviePageComponent implements OnInit {
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

  constructor(private movieService: MovieService, private route: ActivatedRoute, private logger: LoggerService) {}

  ngOnInit() {
    this.isLoading = true;  // Set loading at start

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
        }
        this.isLoading = false;
      })
    ).subscribe();
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
