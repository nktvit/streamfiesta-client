import { Component, OnInit, OnDestroy } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import {NgIf, NgFor, NgClass, TitleCasePipe} from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router';
import { LoggerService } from "../../services/logger.service";
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SearchSuggestion {
  id: string;
  title: string;
  year: string;
  type: string;
  poster: string | null;
}

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TitleCasePipe],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css'
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  searchTerm = "";
  lastSearchTerm = "";
  placeholder = "Enter any title...";
  mode: 'home' | 'search' = 'home';
  isPromptUpdated = false;
  isLoading = false;
  isFocused = false;

  // Suggestions related properties
  suggestions: SearchSuggestion[] = [];
  showSuggestions = false;
  isLoadingSuggestions = false;
  private searchTerms = new Subject<string>();
  private destroy$ = new Subject<void>();
  protected selectedSuggestionIndex = -1;

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
      this.hideSuggestions();

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

    // Setup search suggestions
    this.searchTerms.pipe(
      debounceTime(300), // Wait for 300ms pause
      distinctUntilChanged(), // Only emit if the value is different
      takeUntil(this.destroy$) // Automatically unsubscribe when component is destroyed
    ).subscribe(term => {
      this.fetchSuggestions(term);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleInput(e: any) {
    this.searchTerm = e.target.value;
    this.isPromptUpdated = true;

    if (this.searchTerm.length >= 2) {
      this.searchTerms.next(this.searchTerm);
    } else {
      this.hideSuggestions();
    }
  }

  async fetchSuggestions(term: string) {
    if (term.length < 2) return;

    this.isLoadingSuggestions = true;

    try {
      const apiKey = environment.OMDB_API_KEY;
      let suggestions = [];

      // Direct OMDB API call as fallback for development
      if (!environment.production && process.env['NODE_ENV'] !== 'vercel') {
        try {
          const directResponse = await fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(term)}`
          );
          const data = await directResponse.json();

          if (data.Response === 'True') {
            suggestions = data.Search.map((item: { imdbID: any; Title: any; Year: any; Type: any; Poster: string; }) => ({
              id: item.imdbID,
              title: item.Title,
              year: item.Year,
              type: item.Type,
              poster: item.Poster !== 'N/A' ? item.Poster : null
            })).slice(0, 5);
          }
        } catch (directError) {
          this.logger.error('Direct OMDB API call failed:', directError);
          // Continue to try the proxy approach as fallback
        }
      } else {
        // Try the API endpoint (either proxied locally or Vercel function in prod)
        const apiUrl = `/api/suggestions?apikey=${apiKey}&s=${encodeURIComponent(term)}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.suggestions) {
          suggestions = data.suggestions;
        } else if (data.Response === 'True') {
          // Handle direct OMDB response format if our proxy just passes it through
          suggestions = data.Search.map((item: { imdbID: any; Title: any; Year: any; Type: any; Poster: string; }) => ({
            id: item.imdbID,
            title: item.Title,
            year: item.Year,
            type: item.Type,
            poster: item.Poster !== 'N/A' ? item.Poster : null
          })).slice(0, 5);
        }
      }

      this.suggestions = suggestions;
      this.showSuggestions = this.suggestions.length > 0;
      this.selectedSuggestionIndex = -1;
    } catch (error) {
      this.logger.error('Error fetching suggestions:', error);
      this.suggestions = [];
      this.showSuggestions = false;
    } finally {
      this.isLoadingSuggestions = false;
    }
  }

  selectSuggestion(suggestion: SearchSuggestion) {
    this.searchTerm = suggestion.title;
    this.hideSuggestions();
    this.performSearch(suggestion.title);
  }

  hideSuggestions() {
    // Small delay to allow clicks to register
    setTimeout(() => {
      this.showSuggestions = false;
    }, 150);
  }

  handleFocus() {
    this.placeholder = "";
    this.isFocused = true;
    if (this.searchTerm.length >= 2) {
      this.searchTerms.next(this.searchTerm);
    }
  }

  handleFocusOut() {
    this.placeholder = "Enter any title...";
    this.isFocused = false;
    this.hideSuggestions();
  }

  handleSubmit(event: any) {
    event.preventDefault();
    if (this.isPromptUpdated && !this.isLoading) {
      this.performSearch(this.searchTerm);
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.showSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
        break;
      case 'Enter':
        if (this.selectedSuggestionIndex >= 0) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.hideSuggestions();
        break;
    }
  }
}
