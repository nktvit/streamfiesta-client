import { Component, Input } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SearchBoxComponent, RouterLink, NgIf, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() showSearchBox: boolean = false
  isOpenMenu: boolean = false
}
