import { Component } from '@angular/core';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { MoviesGridComponent } from '../../components/movies-grid/movies-grid.component';
import { MovieService } from '../../services/movie.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { NotfoundComponent } from '../../components/notfound/notfound.component';
import {IMovie} from "../../interfaces/IMovie";
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchBoxComponent, MoviesGridComponent, PaginationComponent, NavbarComponent, NgIf, NotfoundComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {
  movies: IMovie[] = [];
  totalResults: number = 0;
  currentPage: number = 1;

  isLoading: boolean = false

  constructor(private movieService: MovieService, private router: Router, private route: ActivatedRoute, private logger: LoggerService) { }

  loadMovies(prompt: string, page: number) {
    this.isLoading = true;

    try {
      this.logger.log("search page", prompt, page);

      this.movieService.searchMovies(prompt, page);
    } catch (error) {
      this.logger.error('Error during search:', error);
    } finally {
      this.isLoading = false;
      this.logger.log(this.isLoading);

    }
  }

  ngOnInit(): void {
    this.movieService.totalResults$.subscribe(total => {
      this.totalResults = total;
    });

    this.movieService.searchResults$.subscribe(results => {
      this.movies = results;
    });

    // Handling initial query param
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      const page: number = params['page'] || 1; // Default page 1

      if (query && this.movies.length === 0) {
        this.loadMovies(query, page);
      }
    });
  }

  onPageChange(page: number): void {
    // Assuming the search box or another component triggers searchMovies in the service
    this.loadMovies(this.movieService.currentQuery, page);
    this.router.navigate(['/search'], { queryParams: { page }, queryParamsHandling: 'merge' });
    this.currentPage = page
  }
}



