import { Component, Input, OnInit } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { RouterLink, Router } from '@angular/router';
import {AsyncPipe, NgClass, NgIf} from '@angular/common';
import {LoggerService} from "../../services/logger.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SearchBoxComponent, RouterLink, NgIf, NgClass, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() showSearchBox: boolean = false;
  isOpenMenu: boolean = false;
  currentPage = "/";

  constructor(
    private router: Router,
    private logger: LoggerService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentPage = this.router.url;
    this.logger.log(this.currentPage);
  }

  logout(): void {
    this.authService.logout();
  }
}
