import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {environment} from "../../environments/environment";

export interface IUser {
  _id: string;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/users';
  private userSubject = new BehaviorSubject<IUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.userSubject.next(JSON.parse(savedUser));
    }
  }

  createUser(userData: { username: string; email: string; password: string }): Observable<IUser> {
    return this.http.post<IUser>(this.apiUrl, userData).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        this.userSubject.next(user);
      })
    );
  }

  getUserByEmail(email: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/email/${email}`).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAuthenticated', 'true');
        this.userSubject.next(user);
      })
    );
  }
  getCurrentUserId(): string {
    const user = this.userSubject.value;
    return user?._id || '';
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    this.userSubject.next(null);
    this.router.navigate(['/auth']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }
}
