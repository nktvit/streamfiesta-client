import {Component} from '@angular/core';
import {MovieService} from '../../services/movie.service';
import {ActivatedRoute} from '@angular/router';
import {NgClass, NgFor, NgIf, NgOptimizedImage} from '@angular/common';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {BackButtonComponent} from '../../components/back-button/back-button.component';
import {MoviePlayerComponent} from "../../components/movie-player/movie-player.component";

@Component({
  selector: 'app-movie-page',
  standalone: true,
  imports: [NgIf, NgFor, NavbarComponent, BackButtonComponent, NgClass, NgOptimizedImage, MoviePlayerComponent],
  templateUrl: './movie-page.component.html',
  styleUrl: './movie-page.component.css'
})
export class MoviePageComponent {
  isLoading = false

  isFullPlot = false

  movieId: string = ""
  movieDetails: any = {}

  movieDetailsArray: any[] = [];

  rating: any;

  constructor(private movieService: MovieService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {

      var id = params.get('id')
      if (id !== null) {
        this.movieId = id;
        this.loadMovieDetails()
      }
    });

    // subscribe on movieDetails
    this.movieService.movieDetails$.subscribe(results => {
      if (results) {
        this.isLoading = false;

      }

      this.movieDetails = results;
      this.movieDetailsArray = [
        {
          label: 'Director',
          value: this.movieDetails.Director,
          show: this.movieDetails.Director && this.movieDetails.Director !== 'N/A'
        },
        {label: 'Writers', value: this.movieDetails.Writer, show: true},
        {label: 'Stars', value: this.movieDetails.Actors, show: true},
        {
          label: 'Awards',
          value: this.movieDetails.Awards,
          show: this.movieDetails.Awards && this.movieDetails.Awards !== 'N/A'
        },
        {
          label: 'Total Seasons',
          value: this.movieDetails.totalSeasons,
          show: this.movieDetails.totalSeasons && this.movieDetails.totalSeasons !== 'N/A'
        },
      ];
    });


  }


  loadMovieDetails() {
    this.movieService.getMovieDetails(this.movieId)
    this.isLoading = true
    this.movieDetails = this.movieService.movieDetails$;
  }

}
