import {Component, inject, input} from '@angular/core';
import {PosterComponent} from "../poster/poster.component";
import {LoggerService} from "../../services/logger.service";

@Component({
  selector: 'app-movies-grid',
  imports: [PosterComponent],
  templateUrl: './movies-grid.component.html',
  styleUrl: './movies-grid.component.css'
})
export class MoviesGridComponent {
  readonly movies = input<any[]>([]);

  private logger = inject(LoggerService);

  ngOnInit() {
    this.logger.log('Movies in MoviesGridComponent:', this.movies());
  }
}
