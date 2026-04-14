import { Component, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
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
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('TV Shows — Trending & Popular | Stream Fiesta');
    this.metaService.updateTag({ name: 'description', content: 'Browse trending and popular TV shows. Watch free, no sign-up.' });
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
