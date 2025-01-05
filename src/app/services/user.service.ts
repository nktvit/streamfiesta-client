import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, distinctUntilChanged, first, Observable, of, ReplaySubject, retry, throwError} from 'rxjs';
import {catchError, map, switchMap, tap, filter} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {environment} from '../../environments/environment';
import {error} from "@angular/compiler-cli/src/transformers/util";
import {LoggerService} from "./logger.service";

export interface IDBUser {
  _id: string;
  auth0Id: string;
  email: string;
  username: string;
  watchlist: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.BACKEND_URL}/api/v1/users`;
  private currentUserSubject = new BehaviorSubject<IDBUser | null>(null);
  private watchlistSubject = new ReplaySubject<string[]>(1);

  currentUser$ = this.currentUserSubject.asObservable();
  watchlist$ = this.watchlistSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    // Initialize with empty watchlist
    this.watchlistSubject.next([]);
    this.initializeUserState()
  }

  private initializeUserState(): void {
    this.authService.user$
      .pipe(
        filter(user => !!user),
        switchMap(auth0User => this.findOrCreateUser(auth0User)),
        switchMap(user => {
          if (user) {
            return this.getWatchlist().pipe(
              tap(watchlist => {
                this.watchlistSubject.next(watchlist);
              }),
              map(() => user)
            );
          }
          return of(null);
        }),
        catchError(error => {
          this.logger.error('Initial user sync error:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  addToWatchlist(movieId: string): Observable<IDBUser> {
    return this.http.post<IDBUser>(`${this.apiUrl}/watchlist/add`, { movieId }).pipe(
      tap(user => {
        // Ensure we're updating both subjects
        this.currentUserSubject.next(user);
        if (user?.watchlist) {
          this.watchlistSubject.next([...user.watchlist]);
        }
      }),
      retry(1),
      catchError(error => {
        this.logger.error('Error adding to watchlist:', error);
        return throwError(() => error);
      })
    );
  }

  removeFromWatchlist(movieId: string): Observable<IDBUser> {
    return this.http.post<IDBUser>(`${this.apiUrl}/watchlist/remove`, { movieId }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.watchlistSubject.next(user.watchlist);
      }),
      catchError(error => {
        this.logger.error('Error removing from watchlist:', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Get user's watchlist
   * @returns Observable of movie IDs
   * @throws Error if request fails
   */
  getWatchlist(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/watchlist`).pipe(
      tap(watchlist => this.watchlistSubject.next(watchlist)),
      catchError(error => {
        this.logger.error('Error fetching watchlist:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if movie is in user's watchlist
   * @param movieId Movie identifier
   * @returns Observable of boolean
   */
  isInWatchlist(movieId: string): Observable<boolean> {
    return this.watchlist$.pipe(
      map(watchlist => watchlist.includes(movieId)),
      distinctUntilChanged()
    );
  }

  initializeWatchlist(watchlist: string[]) {
    this.watchlistSubject.next(watchlist);
  }

  /**
   * Error handling method
   * @param operation Operation that failed
   * @param result Optional result to return on error
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      this.logger.error(`${operation} failed:`, error);

      if (error.status === 401) {
        // Token expired or invalid, trigger re-authentication
        this.authService.logout();
      }

      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
  /**
   * Find or create user in database
   * @param auth0User Authentication user object
   * @returns Observable of database user
   */
  private findOrCreateUser(auth0User: any): Observable<IDBUser> {
    return this.http
      .post<IDBUser>(`${this.apiUrl}/sync`, {
        auth0Id: auth0User.sub,
        email: auth0User.email,
        username: auth0User.nickname || auth0User.name,
      })
      .pipe(
        tap((user) => {
          if (!user) {
            throw new Error('User not found or created');
          }
          this.currentUserSubject.next(user);
        }),
        catchError((error) => {
          this.logger.error('Error in findOrCreateUser:', error);
          throw error; // Propagate the error
        })
      );
  }

  /**
   * Manually trigger a user sync
   * @returns Observable of user data
   */
  manualSync(): Observable<IDBUser | null> {
    return this.authService.user$.pipe(
      switchMap((auth0User) =>
        auth0User ? this.findOrCreateUser(auth0User) : of(null)
      )
    );
  }

  /**
   * Clear current user data (useful for logout)
   */
  clearUserData() {
    this.currentUserSubject.next(null);
  }
}
