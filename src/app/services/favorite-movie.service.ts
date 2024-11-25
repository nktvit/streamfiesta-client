import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface IFavoriteMovie {
  _id: string;
  user: string;
  imdbId: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteMovieService {
  private apiUrl = 'http://localhost:3000/api/v1/favorite-movies';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  addToFavorites(movieData: { imdbId: string; title: string }): Observable<IFavoriteMovie> {
    const userId = this.authService.getCurrentUserId();
    return this.http.post<IFavoriteMovie>(this.apiUrl, {
      userId,
      ...movieData
    });
  }

  getFavorites(): Observable<IFavoriteMovie[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<IFavoriteMovie[]>(`${this.apiUrl}/${userId}`);
  }

  removeFromFavorites(movieId: string): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    return this.http.delete(`${this.apiUrl}/${userId}/${movieId}`);
  }
}
