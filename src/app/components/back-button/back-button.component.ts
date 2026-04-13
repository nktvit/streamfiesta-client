import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  private router = inject(Router);

  handleClick() {
    // Navigate home to avoid iframe history pollution from embedded players
    this.router.navigate(['/']);
  }
}
