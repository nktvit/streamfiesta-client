import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { PosterComponent } from '../../components/poster/poster.component';
import { TmdbService } from '../../services/tmdb.service';
import { IMovie } from '../../interfaces/movie.interface';

@Component({
  selector: 'app-tv',
  imports: [NavbarComponent, PosterComponent],
  templateUrl: './tv.component.html',
  styleUrl: './tv.component.css',
})
export class TvComponent {
  trendingTV: IMovie[] = [];
  popularTV: IMovie[] = [];
  currentPage = 1;
  totalPages = 0;
  loading = true;

  private tmdb = inject(TmdbService);

  ngOnInit() {
    this.tmdb.getTrendingTV().subscribe(movies => {
      this.trendingTV = movies.slice(0, 15);
    });
    this.loadPopular();
  }

  loadPopular() {
    this.loading = true;
    this.tmdb.getPopularTV(this.currentPage).subscribe(result => {
      this.popularTV = result.movies;
      this.totalPages = result.totalPages;
      this.loading = false;
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadPopular();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
