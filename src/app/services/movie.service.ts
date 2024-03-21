import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })


export class MovieService {
  private API_KEY = environment.OMDB_API_KEY;

  currentQuery: string = '';

  private searchResults = new BehaviorSubject<any>([]);
  public searchResults$ = this.searchResults.asObservable();

  private movieDetails = new BehaviorSubject<any>({})
  public movieDetails$ = this.movieDetails.asObservable()

  // page states
  private currentPageSource = new BehaviorSubject<number>(1);
  private totalResultsSource = new BehaviorSubject<number>(0);

  currentPage$ = this.currentPageSource.asObservable();
  totalResults$ = this.totalResultsSource.asObservable();
  
  constructor(private http: HttpClient) { }

  searchMovies(searchTerm: string, page: number = 1): void {
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
    this.currentQuery = searchTerm;
    const url = `http://www.omdbapi.com/?apikey=${this.API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.Search) {
          this.searchResults.next(response.Search);
          this.currentPageSource.next(page);
          this.totalResultsSource.next(response.totalResults);
          console.log(response.totalResults);
          
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

  searchMovieById(id: string): void {
    if (environment.USE_STATIC_DATA === 'true') {
      var staticData = { "Title": "The Godfather", "Year": "1972", "Rated": "R", "Released": "24 Mar 1972", "Runtime": "175 min", "Genre": "Crime, Drama", "Director": "Francis Ford Coppola", "Writer": "Mario Puzo, Francis Ford Coppola", "Actors": "Marlon Brando, Al Pacino, James Caan", "Plot": "The Godfather \"Don\" Vito Corleone is the head of the Corleone mafia family in New York. He is at the event of his daughter's wedding. Michael, Vito's youngest son and a decorated WW II Marine is also present at the wedding. Michael seems to be uninterested in being a part of the family business. Vito is a powerful man, and is kind to all those who give him respect but is ruthless against those who do not. But when a powerful and treacherous rival wants to sell drugs and needs the Don's influence for the same, Vito refuses to do it. What follows is a clash between Vito's fading old values and the new ways which may cause Michael to do the thing he was most reluctant in doing and wage a mob war against all the other mafia families which could tear the Corleone family apart.", "Language": "English, Italian, Latin", "Country": "United States", "Awards": "Won 3 Oscars. 31 wins & 31 nominations total", "Poster": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", "Ratings": [{ "Source": "Internet Movie Database", "Value": "9.2/10" }, { "Source": "Rotten Tomatoes", "Value": "97%" }, { "Source": "Metacritic", "Value": "100/100" }], "Metascore": "100", "imdbRating": "9.2", "imdbVotes": "1,997,580", "imdbID": "tt0068646", "Type": "movie", "DVD": "01 Aug 2013", "BoxOffice": "$136,381,073", "Production": "N/A", "Website": "N/A", "Response": "True" }
      this.movieDetails.next(staticData);
      console.log(staticData);

      return;
    }

    const url = `http://www.omdbapi.com/?apikey=${this.API_KEY}&i=${encodeURIComponent(id)}&plot=full`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response) {

          this.movieDetails.next(response);
        } else {
          this.movieDetails.next({});

        }
        console.log(response, id);

      },
      error: (error) => {
        console.error('Error fetching data: ', error);
        this.movieDetails.next({});
      }
    });
  }
}







