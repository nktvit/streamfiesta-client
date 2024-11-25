// guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // Store the attempted URL for redirecting
    // localStorage.setItem('redirectUrl', state.url);

    // Redirect to the login page
    this.router.navigate(['/auth']);
    return false;
  }
}
