import { inject, Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];
  private nextIsReplace = false;

  private router = inject(Router);

  init() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationStart)
    ).subscribe(() => {
      this.nextIsReplace = this.router.getCurrentNavigation()?.extras?.replaceUrl === true;
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(event => {
      const url = (event as NavigationEnd).urlAfterRedirects;
      if (this.nextIsReplace && this.history.length > 0) {
        this.history[this.history.length - 1] = url;
      } else if (this.history[this.history.length - 1] !== url) {
        this.history.push(url);
      }
      this.nextIsReplace = false;
    });
  }

  back(): string | null {
    // Remove current page
    this.history.pop();
    // Return previous page
    return this.history.pop() || null;
  }
}
