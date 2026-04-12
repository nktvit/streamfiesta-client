import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  private _location = inject(Location);
  private router = inject(Router);

  handleClick() {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
