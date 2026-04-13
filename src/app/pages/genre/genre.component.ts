import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PosterComponent } from '../../components/poster/poster.component';
import { TmdbService } from '../../services/tmdb.service';
import { IMovie } from '../../interfaces/movie.interface';

@Component({
  selector: 'app-genre',
  imports: [NavbarComponent, PosterComponent],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.css',
})
export class GenreComponent {
  movies: IMovie[] = [];
  genreName = '';
  genreId = 0;
  currentPage = 1;
  totalPages = 0;
  loading = true;

  private route = inject(ActivatedRoute);
  private tmdb = inject(TmdbService);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.genreId = +(params.get('id') || 0);
      this.currentPage = 1;
      this.loadGenreName();
      this.loadMovies();
    });
  }

  loadGenreName() {
    this.tmdb.getGenres().subscribe(genres => {
      const genre = genres.find(g => g.id === this.genreId);
      this.genreName = genre ? genre.name : 'Genre';
    });
  }

  loadMovies() {
    this.loading = true;
    this.tmdb.discoverByGenre(this.genreId, this.currentPage).subscribe(result => {
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
