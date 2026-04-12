import { Component, inject, input } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  readonly action = input<() => void>(() => {});

  private _location = inject(Location);

  handleClick() {
    const fn = this.action();
    if (fn) {
      fn();
      this._location.back();
    }
  }
}
