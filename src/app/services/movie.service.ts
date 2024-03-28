import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) { }


  searchMovies(searchTerm: string, page: number = 1): void {

    this.currentQuery = searchTerm;
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.Search) {
          // this.router.navigate(['/search'], { queryParams: { query: searchTerm, page } });


          this.searchResults.next(response.Search);
          this.currentPageSource.next(page);
          this.totalResultsSource.next(response.totalResults);          

        } else {
          this.searchResults.next([]);
          this.totalResultsSource.next(0);          

        }
      },
      error: (error) => {
        console.error('Error fetching data: ', error);
        this.searchResults.next([]);
      }
    });
  }

  searchMovieById(id: string): void {
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&i=${encodeURIComponent(id)}&plot=full`;
    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/movie', id]);

          this.movieDetails.next(response);
        } else {
          this.movieDetails.next({});

        }
      },
      error: (error) => {
        console.error('Error fetching data: ', error);
        this.movieDetails.next({});
      }
    });
  }
}







