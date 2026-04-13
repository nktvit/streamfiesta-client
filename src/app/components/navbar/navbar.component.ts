import { Component, inject, input, HostListener } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoggerService } from "../../services/logger.service";
import { TmdbService } from "../../services/tmdb.service";

@Component({
  selector: 'app-navbar',
  imports: [SearchBoxComponent, RouterLink, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  readonly showSearchBox = input<boolean>(false);
  readonly transparent = input<boolean>(false);
  isOpenMenu = false;
  isGenreOpen = false;
  currentPage = "/";
  scrolled = false;
  genres: { id: number; name: string }[] = [];

  private router = inject(Router);
  private logger = inject(LoggerService);
  private tmdb = inject(TmdbService);

  ngOnInit(): void {
    this.currentPage = this.router.url;
    this.logger.log(this.currentPage);
    this.tmdb.getGenres().subscribe(g => this.genres = g);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.isGenreOpen && !(event.target as HTMLElement).closest('.genre-dropdown')) {
      this.isGenreOpen = false;
    }
  }
}
