import { NgForOf, NgIf } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
import {PosterComponent} from "../poster/poster.component";
@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf, RouterLink, PaginationComponent, PosterComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent implements OnInit{
  @Input() movies: any[] = [];

  ngOnInit() {
    console.log('Movies in MoviesGridComponent:', this.movies);
  }
}
