import {Component, OnInit} from '@angular/core';
import {FavoriteMovieService, IFavoriteMovie} from "../../services/favorite-movie.service";
import {RouterLink} from "@angular/router";
import {NgForOf, NgIf} from "@angular/common";
import {NavbarComponent} from "../../components/navbar/navbar.component";

@Component({
  selector: 'app-favorites',
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    NavbarComponent
  ],
  templateUrl: './favorites.component.html',
  standalone: true,
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent implements OnInit {
  favorites: IFavoriteMovie[] = [];
  isLoading = true;
  error = '';

  constructor(private favoriteMovieService: FavoriteMovieService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.favoriteMovieService.getFavorites().subscribe({
      next: (movies) => {
        this.favorites = movies;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load wishlist movies. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  removeFromFavorites(movieId: string): void {
    this.favoriteMovieService.removeFromFavorites(movieId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(movie => movie._id !== movieId);
      },
      error: (err) => {
        this.error = 'Failed to remove movie from wishlist. Please try again later.';
      }
    });
  }
}
