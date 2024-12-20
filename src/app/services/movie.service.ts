import {Injectable} from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, of, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment'
import {Router, ActivatedRoute} from '@angular/router';
import {LoggerService} from "./logger.service";

@Injectable({providedIn: 'root'})


export class MovieService {
  private API_KEY = environment.OMDB_API_KEY;

  currentQuery: string = '';

  private searchResults = new BehaviorSubject<any>([]);
  public searchResults$ = this.searchResults.asObservable();

  private movieDetailsSubject = new BehaviorSubject<any>({})
  public movieDetails$ = this.movieDetailsSubject.asObservable()

  // page states
  private currentPageSource = new BehaviorSubject<number>(1);
  private totalResultsSource = new BehaviorSubject<number>(0);

  currentPage$ = this.currentPageSource.asObservable();
  totalResults$ = this.totalResultsSource.asObservable();

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private logger: LoggerService) {
  }


  searchMovies(searchTerm: string, page: number = 1): Observable<any> {
    this.currentQuery = searchTerm;
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`;

    return this.http.get<any>(url).pipe(
      tap(response => {
        if (response && response.Search) {
          this.searchResults.next(response.Search);
          this.currentPageSource.next(page);
          this.totalResultsSource.next(response.totalResults);
        } else {
          this.searchResults.next([]);
          this.totalResultsSource.next(0);
        }
      }),
      catchError(error => {
        this.logger.error('Error fetching data: ', error);
        this.searchResults.next([]);
        return of(null);
      })
    );
  }

  getMovieDetails(movieId: string): Observable<any> {
    return this.fetchMovieDetails(movieId).pipe(
      tap((response) => {
        if (response) {
          this.movieDetailsSubject.next(response);
        }
      }),
      catchError((error) => {
        this.logger.error('Error fetching data: ', error);
        this.movieDetailsSubject.next({});
        return of(null);
      })
    );
  }

  private fetchMovieDetails(id: string): Observable<any> {
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&i=${encodeURIComponent(id)}&plot=full`;
    return this.http.get<any>(url, {observe: 'response'}).pipe(
      map((response) => {
        if (response.ok && response.body && response.body.imdbID) {
          return response.body;
        } else {
          throw new Error('Invalid API response');
        }
      }),
      tap((response) => {
        this.movieDetailsSubject.next(response);
      }),
      catchError((error) => {
        this.logger.error('Error fetching data: ', error);
        this.movieDetailsSubject.next({});
        return of(null);
      })
    );
  }

  getImdbId(movieDetails: any): string {
    if (movieDetails && movieDetails.imdbID) {
      return movieDetails.imdbID;
    }
    return '';
  }
  getMediaType(movieDetails: any): string {
    if (movieDetails.Type === 'movie') return 'movie'
    else if (movieDetails.Type === 'series') return 'tv'
    else {
      return 'movie'
    }
  }
  formatMovieDetailsArray(details: any) {
    return [
      { label: 'Director', value: details.Director, show: details.Director && details.Director !== 'N/A' },
      { label: 'Country', value: details.Country, show: details.Country && details.Country !== 'N/A' },
      { label: 'Language', value: details.Language, show: details.Language && details.Language !== 'N/A' },
      { label: 'Writers', value: details.Writer, show: details.Writer && details.Writer !== 'N/A' },
      { label: 'Stars', value: details.Actors, show: true },
      { label: 'Awards', value: details.Awards, show: details.Awards && details.Awards !== 'N/A' },
      { label: 'Box Office', value: details.BoxOffice, show: details.BoxOffice && details.BoxOffice !== 'N/A' },
    ];
  }

}






