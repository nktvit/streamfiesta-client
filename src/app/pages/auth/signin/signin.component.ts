import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {NgClass, NgIf} from '@angular/common'
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { LoggerService } from '../../../services/logger.service';
import { PbManagerService } from '../../../services/pbmanager.service';
import { ClientResponseError } from 'pocketbase';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink,
    NavbarComponent,
    NgClass
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SignInComponent {
  signinForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private logger: LoggerService,
    private pbManager: PbManagerService
  ) {
    this.signinForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Redirect if already logged in
    if (this.pbManager.isAuthenticated) {
      this.router.navigate(['/profile']);
    }
  }

  get email() { return this.signinForm.get('email'); }
  get password() { return this.signinForm.get('password'); }

  async onSubmit() {
    if (this.signinForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.signinForm.value;

      await this.pbManager.instance.collection('users').authWithPassword(
        email,
        password
      );

      this.logger.log('User authenticated successfully');
      this.router.navigate(['/profile']);
    } catch (error) {
      this.logger.error('Authentication error:', error);

      if (error instanceof ClientResponseError) {
        if (error.status === 400) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = error.message || 'An error occurred during sign in.';
        }
      } else {
        this.errorMessage = 'An error occurred during sign in. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
