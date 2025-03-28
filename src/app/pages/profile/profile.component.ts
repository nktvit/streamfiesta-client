import {Component} from '@angular/core'
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms"
import {LogoutButtonComponent} from "../../components/logout-button/logout-button.component"
import {DatePipe, NgClass, NgIf} from "@angular/common"
import {NavbarComponent} from "../../components/navbar/navbar.component"
import {Router} from "@angular/router"
import {LoggerService} from "../../services/logger.service"
import {PbManagerService} from "../../services/pbmanager.service"
import {ClientResponseError} from "pocketbase"

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NavbarComponent,
    DatePipe,
    LogoutButtonComponent,
    NgClass
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  profileForm: FormGroup
  isLoading = false
  saveSuccess = false
  errorMessage = ''
  verificationSent = false
  verificationError = ''
  refreshingAuth = true


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private logger: LoggerService,
    private pbManager: PbManagerService
  ) {
    this.profileForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    })

    // Redirect if not logged in
    if (!this.pbManager.isAuthenticated) {
      this.router.navigate(['/signin'])
      return
    }

    const user = this.pbManager.currentUser
    if (user) {
      this.profileForm.patchValue({
        username: user['name'],
        email: user['email']
      })
    }
  }

  async ngOnInit() {
    // Refresh auth data to get the latest verification status
    this.refreshingAuth = true
    try {
      await this.pbManager.refreshAuth()
      this.logger.log('Auth refreshed on profile page load')
    } catch (error) {
      this.logger.error('Failed to refresh auth on profile load:', error)
    } finally {
      this.refreshingAuth = false
    }
  }

  private initializeProfile() {
    const user = this.pbManager.currentUser
    if (user) {
      this.profileForm.patchValue({
        username: user['name'],
        email: user['email']
      })
    }
  }


  get username() {
    return this.profileForm.get('username')
  }

  get email() {
    return this.profileForm.get('email')
  }

  get user() {
    return this.pbManager.currentUser
  }

  get isVerified() {
    return this.pbManager.isVerified
  }

  async resendVerification() {
    if (!this.user || !this.user['email']) {
      this.verificationError = 'Cannot resend verification email. Email not found.'
      return
    }

    this.verificationSent = false
    this.verificationError = ''

    try {
      await this.pbManager.requestVerification(this.user['email'])
      this.verificationSent = true

      // Reset after 5 seconds
      setTimeout(() => {
        this.verificationSent = false
      }, 5000)
    } catch (error) {
      this.logger.error('Failed to resend verification email:', error)

      if (error instanceof ClientResponseError) {
        this.verificationError = error.message
      } else {
        this.verificationError = 'Failed to send verification email. Please try again later.'
      }
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      return
    }

    this.isLoading = true
    this.saveSuccess = false
    this.errorMessage = ''

    try {
      const {username, email} = this.profileForm.value

      if (!this.user) {
        throw new Error('User not authenticated')
      }

      await this.pbManager.instance.collection('users').update(this.user.id, {
        name: username,
        email: email
      })

      this.logger.log('Profile updated successfully')
      this.saveSuccess = true

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.saveSuccess = false
      }, 3000)

    } catch (error) {
      this.logger.error('Profile update error:', error)

      if (error instanceof ClientResponseError) {
        if (error.status === 400) {
          if (error.data['email']) {
            this.errorMessage = `Email: ${error.data['email'].message}`
          } else if (error.data['name']) {
            this.errorMessage = `Username: ${error.data['name'].message}`
          } else {
            this.errorMessage = error.message
          }
        } else {
          this.errorMessage = error.message
        }
      } else {
        this.errorMessage = 'Failed to update profile. Please try again.'
      }
    } finally {
      this.isLoading = false
    }
  }
}
