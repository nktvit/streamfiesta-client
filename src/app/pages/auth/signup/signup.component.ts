import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms"
import {NgClass, NgIf} from "@angular/common"
import {Router, RouterLink} from "@angular/router"
import {NavbarComponent} from "../../../components/navbar/navbar.component"
import {LoggerService} from "../../../services/logger.service"
import {PbManagerService} from "../../../services/pbmanager.service"
import {ClientResponseError} from "pocketbase"

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink,
    NavbarComponent,
    NgClass
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignUpComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showVerificationSent = false;

  constructor(
    private formBuilder: FormBuilder,
    protected router: Router,
    private logger: LoggerService,
    private pbManager: PbManagerService
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Redirect if already logged in
    if (this.pbManager.isAuthenticated) {
      this.router.navigate(['/profile']);
    }
  }

  get username() { return this.signupForm.get('username'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get passwordConfirm() { return this.signupForm.get('passwordConfirm'); }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const passwordConfirm = formGroup.get('passwordConfirm')?.value;

    if (password !== passwordConfirm) {
      formGroup.get('passwordConfirm')?.setErrors({ passwordMismatch: true });
    }
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showVerificationSent = false;

    try {
      const { username, email, password, passwordConfirm } = this.signupForm.value;

      // Create user
      await this.pbManager.instance.collection('users').create({
        email,
        password,
        passwordConfirm,
        name: username,
        emailVisibility: true
      });

      // Login after registration
      await this.pbManager.instance.collection('users').authWithPassword(
        email,
        password
      );

      this.logger.log('User registered and authenticated successfully');

      // Send verification email
      try {
        await this.pbManager.requestVerification(email);
        this.showVerificationSent = true;
        this.successMessage = 'Registration successful! Please check your email to verify your account.';
      } catch (verificationError) {
        this.logger.error('Failed to send verification email:', verificationError);
        // show a success message anyway, but note the verification issue
        this.successMessage = 'Registration successful! We encountered an issue sending your verification email. You can request another one from your profile.';
      }
    } catch (error) {
      this.logger.error('Registration error:', error);

      if (error instanceof ClientResponseError) {
        if (error.status === 400) {
          if (error.data['email']) {
            this.errorMessage = `Email: ${error.data['email'].message}`;
          } else if (error.data['password']) {
            this.errorMessage = `Password: ${error.data['password'].message}`;
          } else if (error.data['passwordConfirm']) {
            this.errorMessage = `Password confirmation: ${error.data['passwordConfirm'].message}`;
          } else if (error.data['name']) {
            this.errorMessage = `Username: ${error.data['name'].message}`;
          } else {
            this.errorMessage = error.message;
          }
        } else {
          this.errorMessage = error.message;
        }
      } else {
        this.errorMessage = 'Registration failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }
}
