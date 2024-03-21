import { Component, Input } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {
  @Input() action: () => void = () => {
    console.log("Back button");
    
  }; 

  constructor(private _location: Location) 
  {}

  handleClick() {    
    if (this.action) {
      this.action();
      this._location.back();
      console.log(this._location);
      
    }
  }
}
