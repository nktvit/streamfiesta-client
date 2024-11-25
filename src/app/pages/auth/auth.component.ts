import {Component, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-auth',
  imports: [NgIf, NavbarComponent, NgClass, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  standalone: true,
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isSignUp = true;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.authForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  toggleAuthMode(event: Event): void {
    event.preventDefault();
    this.isSignUp = !this.isSignUp;

    if (this.isSignUp) {
      this.authForm.addControl('username', this.fb.control('', [
        Validators.required,
        Validators.minLength(3)
      ]));
    } else {
      this.authForm.removeControl('username');
    }

    this.authForm.reset();
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.authForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      if (this.isSignUp) {
        this.authService.createUser(this.authForm.value).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'An error occurred during signup';
            this.isSubmitting = false;
          }
        });
      } else {
        const { email } = this.authForm.value;
        this.authService.getUserByEmail(email).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: () => {
            this.errorMessage = 'Invalid email or password';
            this.isSubmitting = false;
          }
        });
      }
    }
  }
}
