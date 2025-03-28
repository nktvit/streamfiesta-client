import {Component, OnInit} from '@angular/core'
import {NgIf} from "@angular/common"
import {ActivatedRoute, Router, RouterLink} from "@angular/router"
import {NavbarComponent} from "../../../components/navbar/navbar.component"
import {PbManagerService} from "../../../services/pbmanager.service"
import {LoggerService} from "../../../services/logger.service"

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './verify.component.html'
})
export class VerifyComponent implements OnInit {
  isLoading = true;
  verificationSuccess = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pbManager: PbManagerService,
    private logger: LoggerService
  ) {}

  async ngOnInit() {
    // Get token from URL
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];

      if (!token) {
        this.isLoading = false;
        this.errorMessage = 'Invalid verification link. No token provided.';
        return;
      }

      try {
        const success = await this.pbManager.confirmVerification(token);
        this.verificationSuccess = success;

        if (success) {
          // If user is logged in, refresh their auth data to update verification status
          if (this.pbManager.isAuthenticated) {
            await this.pbManager.refreshAuth();
          }
        } else {
          this.errorMessage = 'Failed to verify your email. This link may have expired.';
        }
      } catch (error) {
        this.logger.error('Verification error:', error);
        this.errorMessage = 'An error occurred during verification. Please try again.';
      } finally {
        this.isLoading = false;
      }
    });
  }
}
