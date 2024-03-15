import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  API_KEY = environment.OMDB_API_KEY
  USE_STATIC_DATA = environment.USE_STATIC_DATA
  title = 'movie-streamer';
  searchRequest = ""

  updateSearchRequest(input: string) {
    this.searchRequest = input
  }

  async handleSearchSubmit() {
    console.log(this.searchRequest);

    // Static data to be returned when USE_STATIC_DATA is true
    var staticData = {
      "Title": "The Godfather",
      "Year": "1972",
      "Rated": "R",
      "Released": "24 Mar 1972",
      "Runtime": "175 min",
      "Genre": "Crime, Drama",
      "Director": "Francis Ford Coppola",
      "Writer": "Mario Puzo, Francis Ford Coppola",
      "Actors": "Marlon Brando, Al Pacino, James Caan",
      "Plot": "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      "Language": "English, Italian, Latin",
      "Country": "United States",
      "Awards": "Won 3 Oscars. 31 wins & 31 nominations total",
      "Poster": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
      "Ratings": [
        { "Source": "Internet Movie Database", "Value": "9.2/10" },
        { "Source": "Rotten Tomatoes", "Value": "97%" },
        { "Source": "Metacritic", "Value": "100/100" }
      ],
      "Metascore": "100",
      "imdbRating": "9.2",
      "imdbVotes": "1,997,580",
      "imdbID": "tt0068646",
      "Type": "movie",
      "DVD": "01 Aug 2013",
      "BoxOffice": "$136,381,073",
      "Production": "N/A",
      "Website": "N/A",
      "Response": "True"
    };
    if (environment.USE_STATIC_DATA === 'true') {
      console.log(staticData);
      return staticData; // Return the static data immediately
    }
  
    try {
      // Construct the URL for the Fetch request
      const url = `http://www.omdbapi.com/?apikey=${this.API_KEY}&t=${encodeURIComponent(this.searchRequest)}`;
      const response = await fetch(url, {
        method: 'GET', // Specify the method
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for CORS requests
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching data: ", error);
      // Handle errors, such as network issues or invalid JSON
    }

  }

}
