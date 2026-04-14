import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  private router = inject(Router);
  private nav = inject(NavigationService);

  handleClick() {
    const prev = this.nav.back();
    if (prev) {
      this.router.navigateByUrl(prev);
    } else {
      this.router.navigate(['/']);
    }
  }
}
