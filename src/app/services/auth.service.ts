import { Inject, Injectable } from '@angular/core';
import {BehaviorSubject, Observable, from, throwError, Subscription} from 'rxjs';
import { AuthService as Auth0, User } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';
import { LoggerService } from './logger.service';

export interface IUser {
  _id: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  user$ = this.userSubject.asObservable();
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private logger: LoggerService,
    private auth: Auth0,
    @Inject(DOCUMENT) public document: Document
  ) {
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.logger.log('Auth0 User ID:', user.sub);
        this.logger.log('User Profile:', user);
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });

    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      this.isLoggedInSubject.next(isAuthenticated);
      this.logger.log('User is logged in:', isAuthenticated);
    });
  }

  /**
   * Log out the user and redirect to the home page.
   */
  logout(): void {
    this.auth.logout({
      logoutParams: {
        returnTo: this.document.location.origin,
      },
    });
  }

  /**
   * Redirect the user to the Auth0 login page.
   */
  login(): void {
    this.auth.loginWithRedirect();
  }

  /**
   * Redirect the user to the Auth0 signup page.
   */
  signup(): void {
    this.auth.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  }

  /**
   * Get the access token silently.
   * @returns Observable<string> - The access token.
   */
  getAccessToken(): Subscription {
    return this.auth.getAccessTokenSilently().subscribe((token) => {
      this.logger.log('Access Token:', token);
      return token;
    });
  }

  /**
   * Check if the user is authenticated.
   * @returns Observable<boolean> - True if the user is authenticated, false otherwise.
   */
  isAuthenticated$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  /**
   * Get the current user.
   * @returns Observable<User | null> - The current user or null if not authenticated.
   */
  getUser$(): Observable<User | null> {
    // @ts-ignore
    return this.auth.user$;
  }

  /**
   * Decode a JWT token (for debugging purposes only).
   * @param token - The JWT token.
   * @returns any - The decoded token payload.
   */
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      this.logger.error('Error decoding token:', error);
      return null;
    }
  }
}
