import { Injectable } from '@angular/core';
import PocketBase from "pocketbase"
import {BehaviorSubject} from "rxjs"
import {LoggerService} from "./logger.service"
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PbManagerService {
  private BACKEND_URL: string = environment.BACKEND_URL;
  private pb: PocketBase;
  private authStateSubject = new BehaviorSubject<boolean>(false);

  constructor(private logger: LoggerService) {
    this.pb = new PocketBase(this.BACKEND_URL);

    // Initialize auth state
    this.authStateSubject.next(this.pb.authStore.isValid);

    // Listen for auth changes
    this.pb.authStore.onChange(() => {
      this.authStateSubject.next(this.pb.authStore.isValid);
    });
  }

  get instance() {
    return this.pb;
  }

  get isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  get currentUser() {
    return this.pb.authStore.model;
  }

  get isVerified(): boolean {
    return this.isAuthenticated && this.currentUser?.['verified'] === true;
  }

  async requestVerification(email: string): Promise<void> {
    try {
      await this.pb.collection('users').requestVerification(email);
      this.logger.log('Verification email sent to', email);
    } catch (error) {
      this.logger.error('Failed to send verification email:', error);
      throw error;
    }
  }

  /**
   * Confirm email verification with token
   * @param token The verification token from the email
   * @returns A promise that resolves when verification is confirmed
   */
  async confirmVerification(token: string): Promise<boolean> {
    try {
      await this.pb.collection('users').confirmVerification(token);
      this.logger.log('Email verification confirmed successfully');

      // If the user is logged in, refresh their auth data to update verification status
      if (this.isAuthenticated) {
        await this.refreshAuth();
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to confirm verification:', error);
      return false;
    }
  }

  /**
   * Refresh the current authentication data
   * This is useful after verification to update the verified status
   */
  async refreshAuth(): Promise<boolean> {
    if (!this.isAuthenticated || !this.currentUser) {
      return false;
    }

    try {
      // Get the current auth record to refresh it
      const authData = await this.pb.collection('users').authRefresh();
      this.logger.log('Auth data refreshed successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to refresh auth data:', error);
      // If refresh fails, we may need to re-authenticate
      this.pb.authStore.clear();
      this.authStateSubject.next(false);
      return false;
    }
  }


}


