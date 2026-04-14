import { inject, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];

  private router = inject(Router);

  init() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      // Avoid duplicate consecutive entries (e.g. redirects)
      if (this.history[this.history.length - 1] !== url) {
        this.history.push(url);
      }
    });
  }

  back(): string | null {
    // Remove current page
    this.history.pop();
    // Return previous page
    return this.history.pop() || null;
  }
}
