import { Component, inject, input } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { RouterLink, Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoggerService } from "../../services/logger.service";

@Component({
  selector: 'app-navbar',
  imports: [
    SearchBoxComponent,
    RouterLink,
    NgClass
],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  readonly showSearchBox = input<boolean>(false);
  isOpenMenu: boolean = false
  currentPage = "/"

  private router = inject(Router);
  private logger = inject(LoggerService);

  ngOnInit(): void {
    this.currentPage = this.router.url
    this.logger.log(this.currentPage)
  }
}
