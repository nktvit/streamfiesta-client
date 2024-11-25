import {Component} from '@angular/core';
import {MoviesGridComponent} from '../../components/movies-grid/movies-grid.component';
import {SearchBoxComponent} from '../../components/search-box/search-box.component';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {JsonPipe, NgForOf, NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import {MatMonthView} from "@angular/material/datepicker";
import {PosterComponent} from "../../components/poster/poster.component";
import {IMovie} from "../../interfaces/IMovie";

@Component({
  selector: 'app-main',
  standalone: true,
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  imports: [SearchBoxComponent, MoviesGridComponent, NavbarComponent, NgForOf, RouterLink, JsonPipe, NgOptimizedImage, PosterComponent]
})
export class MainComponent {

  featuredMovies : IMovie[] = [
    {
      Title: 'The Shawshank Redemption',
      Plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
      Poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
      imdbID: 'tt0111161'
    },
    {
      Title: 'The Godfather',
      Plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      Poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
      imdbID: "tt0068646"
    },
    {
      Title: 'The Dark Knight',
      Plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      Poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
      imdbID: "tt0468569"
    },
  ];

  protected readonly MatMonthView = MatMonthView;
}
