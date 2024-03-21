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

  performSearch(prompt: string, page: number = 1) {
    if (prompt !== "" && prompt !== this.lastSearchTerm) {
      this.isLoading = true;
      this.lastSearchTerm = prompt

      // change the query
      this.router.navigate(['/search'], { queryParams: { query: prompt } });
      try {
        this.movieService.searchMovies(prompt, page);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  ngOnInit() {
    // Handling navigation to different pages via query params
    this.route.queryParams.subscribe(params => {
      const query = params['query'];
      const page = params['page'] ? parseInt(params['page'], 10) : 1;

      if (query) {
        // Updating the searchTerm state for the ui
        this.searchTerm = query;
        this.performSearch(query, page);
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

  async handleSubmit(event: any) {
    event.preventDefault();
    if (this.mode === 'home') {
      this.router.navigate(['/search'], { queryParams: { query: this.searchTerm } });
    } else {
      this.performSearch(this.searchTerm)
    }
  }
}
