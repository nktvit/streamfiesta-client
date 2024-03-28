import { NgForOf, NgIf } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, PaginationComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent {
  @Input() movies: any[] = [];

  // ui 
  isLoading = false
  moviesPerChunk = 2

  constructor(private route: ActivatedRoute) { }

  chunk(arr: any[], size: number) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }
}