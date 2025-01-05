import {AsyncPipe, NgForOf, NgIf} from '@angular/common';
import {Component, Input, OnInit} from '@angular/core';
import {PosterComponent} from "../poster/poster.component";
import {LoggerService} from "../../services/logger.service";
import {IMovie} from "../../interfaces/movie.interface";
import {Observable, of} from "rxjs";

@Component({
  selector: 'app-movies-grid',
  standalone: true,
  imports: [NgIf, NgForOf, PosterComponent, AsyncPipe],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent implements OnInit {
  @Input() set movies(value: Observable<IMovie[]> | IMovie[] | null) {
    if (value instanceof Observable) {
      this.movies$ = value;
    } else {
      this.movies$ = of(value || []);
    }
  }

  movies$: Observable<IMovie[]> = of([]);

  constructor(private logger: LoggerService) {
  }

  ngOnInit() {
    this.logger.log('Movies Grid Component Initialized');
  }
}
