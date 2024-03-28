import { NgForOf, NgIf } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, PaginationComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent implements OnInit {
  movies: any[] = [];

  // ui 
  isLoading = false
  moviesPerChunk = 2

  constructor(private movieService: MovieService, private route: ActivatedRoute) { }

  chunk(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }

  loadMovies(prompt: string, page: number) {
      this.isLoading = true;

      try {
      console.log("movies-grid", prompt, page);

        this.movieService.searchMovies(prompt, page);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        this.isLoading = false;
      }
  }
 
  ngOnInit(): void {
    // this.movieService.currentPage$.subscribe(page => {
    //   this.currentPage = page;
    // });
    this.movieService.searchResults$.subscribe(results => {
      this.movies = results;
    });  

    // Handling navigation to different pages via query params
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      const page:number = params['page'];
      
      // const page = params['page'] ? parseInt(params['page'], 10) : 1;

      if (query && this.movies.length === 0) {
        this.loadMovies(query, page)
      }
    });

  

  }
}

