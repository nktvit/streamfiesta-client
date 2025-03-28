import { NgForOf, NgIf } from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {PosterComponent} from "../poster/poster.component";
import {LoggerService} from "../../services/logger.service";
@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf, PosterComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent implements OnInit{
  @Input() movies: any[] = [];

  constructor(private logger: LoggerService) {
  }

  ngOnInit() {
    this.logger.log('Movies in MoviesGridComponent:', this.movies);
  }
}
