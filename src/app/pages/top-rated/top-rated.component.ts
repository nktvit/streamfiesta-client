import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PosterComponent } from '../../components/poster/poster.component';
import { TmdbService } from '../../services/tmdb.service';
import { IMovie } from '../../interfaces/movie.interface';

@Component({
  selector: 'app-top-rated',
  imports: [NavbarComponent, PosterComponent],
  templateUrl: './top-rated.component.html',
  styleUrl: './top-rated.component.css',
})
export class TopRatedComponent {
  movies: IMovie[] = [];
  currentPage = 1;
  totalPages = 0;
  loading = true;

  private tmdb = inject(TmdbService);

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    this.tmdb.getTopRatedPaginated(this.currentPage).subscribe(result => {
      this.movies = result.movies;
      this.totalPages = result.totalPages;
      this.loading = false;
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
