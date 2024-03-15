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
  mode: 'home' | 'search' = 'home';
  isPromptUpdated = false
  isLoading = false;

  constructor(private movieService: MovieService, private route: ActivatedRoute, private router: Router) { }

  performSearch(prompt: string) {
    if (prompt !== "" && prompt !== this.lastSearchTerm) {
      this.isLoading = true;
      this.lastSearchTerm = prompt

      // change the query
      this.router.navigate(['/search'], { queryParams: { query: prompt } });
      try {
        this.movieService.searchMovies(prompt);
      } catch (error) {
        console.error('Error during search:', error);
      } finally {
        this.isLoading = false;
        console.log("loaded");
      }
    }
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.mode = data['mode'];
    });

    // initialize searchTerm from query params if present and perform search
    this.route.queryParams.subscribe(params => {
      if (params['query'] && params['query'] !== this.lastSearchTerm) {
        this.searchTerm = params['query'];
        this.isPromptUpdated = true;
        this.performSearch(this.searchTerm);
      }
    });
  }

  handleInput(e: any) {
    this.searchTerm = e.target.value;
    this.isPromptUpdated = true;
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
