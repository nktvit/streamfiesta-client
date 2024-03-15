import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })


export class MovieService {
  private API_KEY = environment.OMDB_API_KEY;
  private searchResults = new BehaviorSubject<any>([]);
  public searchResults$ = this.searchResults.asObservable();

  constructor(private http: HttpClient) { }

  searchMovies(searchTerm: string): void {
    if (environment.USE_STATIC_DATA === 'true') {
      var staticData = [
        {
          "Title": "The Godfather",
          "Year": "1972",
          "imdbID": "tt0068646",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather Part II",
          "Year": "1974",
          "imdbID": "tt0071562",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather Part III",
          "Year": "1990",
          "imdbID": "tt0099674",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BNWFlYWY2YjYtNjdhNi00MzVlLTg2MTMtMWExNzg4NmM5NmEzXkEyXkFqcGdeQXVyMDk5Mzc5MQ@@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather Trilogy: 1901-1980",
          "Year": "1992",
          "imdbID": "tt0150742",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BMjk5ODZjYmMtYTJjNy00MTU2LWI5OTYtYTg5YjFlMDk3ZjI0XkEyXkFqcGdeQXVyODAyNDE3Mw@@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather Saga",
          "Year": "1977",
          "imdbID": "tt0809488",
          "Type": "series",
          "Poster": "https://m.media-amazon.com/images/M/MV5BNzk3NmZmMjgtMjA4NS00MjdkLTlkZmMtZGFkMDAyNWU4NDdlXkEyXkFqcGdeQXVyODAyNDE3Mw@@._V1_SX300.jpg"
        },
        {
          "Title": "Miracles: The Canton Godfather",
          "Year": "1989",
          "imdbID": "tt0098019",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BYThlMDRmNDYtNDU3YS00YmRkLTg0MWYtODIzZjM3MzViZDU3XkEyXkFqcGdeQXVyNzI1NzMxNzM@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather",
          "Year": "2006",
          "imdbID": "tt0442674",
          "Type": "game",
          "Poster": "https://m.media-amazon.com/images/M/MV5BMTQyNTE4NzMzNF5BMl5BanBnXkFtZTgwMDgzNTY3MDE@._V1_SX300.jpg"
        },
        {
          "Title": "The Black Godfather",
          "Year": "2019",
          "imdbID": "tt10289996",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BZmFhNjM5MTItZDRkNS00ZjUyLTkyMWUtZjg1YWZjMjFlYjg0XkEyXkFqcGdeQXVyNDg4NjY5OTQ@._V1_SX300.jpg"
        },
        {
          "Title": "The Last Godfather",
          "Year": "2010",
          "imdbID": "tt1584131",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BMTYxNTgzOTQyNV5BMl5BanBnXkFtZTcwMzI1NDk3NA@@._V1_SX300.jpg"
        },
        {
          "Title": "The Godfather Family: A Look Inside",
          "Year": "1990",
          "imdbID": "tt0101961",
          "Type": "movie",
          "Poster": "https://m.media-amazon.com/images/M/MV5BZTMyNzE0NWEtOGZjYi00ODU0LWE0OTItMzY5YTllYTcyYzgyXkEyXkFqcGdeQXVyODAyNDE3Mw@@._V1_SX300.jpg"
        }
      ]
      this.searchResults.next(staticData);
      return;
    }

    const url = `http://www.omdbapi.com/?apikey=${this.API_KEY}&s=${encodeURIComponent(searchTerm)}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.Search) {
          this.searchResults.next(response.Search);
        } else {
          this.searchResults.next([]);
        }
      },
      error: (error) => {
        console.error('Error fetching data: ', error);
        this.searchResults.next([]);
      }
    });
  }
}







