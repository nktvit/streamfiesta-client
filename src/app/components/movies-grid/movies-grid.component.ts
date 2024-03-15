import { NgForOf, NgIf } from '@angular/common';
import { MovieService } from './../../services/movie.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent implements OnInit {
  movies: any[] = [];
  moviesPerChunk = 2

  chunk(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.movieService.searchResults$.subscribe(results => {
      this.movies = results;
      console.log("SearchEvent: ", results);
      
    });
  }
}

