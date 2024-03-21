import { Component } from '@angular/core';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { MoviesGridComponent } from '../../components/movies-grid/movies-grid.component';
import { MovieService } from '../../services/movie.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchBoxComponent, MoviesGridComponent, PaginationComponent, NavbarComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {
  totalResults: number = 0;
  currentPage: number = 1;
  
  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.totalResults$.subscribe(total => {
      this.totalResults = total;
    });
    this.movieService.currentPage$.subscribe(page => {
      this.currentPage = page;
    });
    
  }

  onPageChange(page: number): void {
    // Assuming the search box or another component triggers searchMovies in the service
    this.movieService.searchMovies(this.movieService.currentQuery, page); // Implement currentQuery logic in service
  }
}



