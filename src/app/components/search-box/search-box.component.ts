import { Component } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from "../../services/logger.service";

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [NgIf],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css'
})
export class SearchBoxComponent {
  searchTerm = ""
  lastSearchTerm = ""
  placeholder = "Enter any title..."
  mode: 'home' | 'search' = 'home';
  isPromptUpdated = false
  isLoading = false;

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private router: Router,
    private logger: LoggerService
  ) { }

  performSearch(prompt: string) {
    if (prompt !== "" && prompt !== this.lastSearchTerm) {
      this.isLoading = true;
      this.lastSearchTerm = prompt;
      this.logger.log("search-box", prompt);

      this.movieService.searchMovies(prompt).subscribe({
        next: () => {
          this.router.navigate(['/search'], { queryParams: { query: prompt } });
        },
        error: (error) => {
          this.logger.error('Error during search:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  ngOnInit() {
    // populate the inputbox with the request in query
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      if (query) {
        this.searchTerm = query;
        this.lastSearchTerm = query;
      }
    });
  }

  handleInput(e: any) {
    this.searchTerm = e.target.value;
    this.isPromptUpdated = true;
  }

  handleFocus() {
    this.placeholder = ""
  }

  handleFocusOut() {
    this.placeholder = "Enter any title..."
  }

  handleSubmit(event: any) {
    event.preventDefault();
    if (this.isPromptUpdated && !this.isLoading) {
      this.performSearch(this.searchTerm);
    }
  }
}
