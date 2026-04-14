import {Component, inject} from '@angular/core';
import {Title, Meta} from '@angular/platform-browser';
import {PosterComponent} from '../../components/poster/poster.component';
import {MovieService} from '../../services/movie.service';
import {PaginationComponent} from '../../components/pagination/pagination.component';
import {NavbarComponent} from '../../components/navbar/navbar.component';
import {ActivatedRoute, Router} from '@angular/router';

import {NotfoundComponent} from '../../components/notfound/notfound.component';
import {IMovie} from "../../interfaces/movie.interface";
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'app-search-page',
  imports: [PosterComponent, PaginationComponent, NavbarComponent, NotfoundComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {
  movies: IMovie[] = [];
  totalResults: number = 0;
  currentPage: number = 1;

  isLoading: boolean = false

  private movieService = inject(MovieService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private logger = inject(LoggerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  loadMovies(prompt: string, page: number) {
    this.isLoading = true;

    this.movieService.searchMovies(prompt, page)
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          this.logger.error('Error during search:', error);
          this.isLoading = false;
        }
      });
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
      if (query) {
        this.titleService.setTitle(`Search "${query}" | Stream Fiesta`);
        this.metaService.updateTag({ name: 'description', content: `Search results for "${query}" — watch free on Stream Fiesta.` });
      }
      const page: number = params['page'] || 1; // Default page 1

      if (query && this.movies.length === 0) {
        this.loadMovies(query, page);
      }
    });
  }

  onPageChange(page: number): void {
    // Assuming the search box or another component triggers searchMovies in the service
    this.loadMovies(this.movieService.currentQuery, page);
    this.router.navigate(['/search'], {queryParams: {page}, queryParamsHandling: 'merge'});
    this.currentPage = page
  }
}
