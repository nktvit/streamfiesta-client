import { MoviesGridComponent } from './../movies-grid/movies-grid.component';
import { Component } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private movieService: MovieService, private route: ActivatedRoute, private router: Router) { }

  performSearch(prompt: string) {
    if (prompt !== "" && prompt !== this.lastSearchTerm) {
      this.isLoading = true;
      this.lastSearchTerm = prompt

      try {
        console.log("search-box", prompt);

        this.movieService.searchMovies(prompt);
        this.router.navigate(['/search'], { queryParams: { query: prompt } });

      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        this.isLoading = false;
      }


    }
  }

  ngOnInit() {
    // populate the inputbox with the request in query
    this.route.queryParams.subscribe(params => {
      const query = params['query'];

      if (query) {
        this.searchTerm = query;
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

    if (this.isPromptUpdated) {
      this.performSearch(this.searchTerm)
    }
  }
}
