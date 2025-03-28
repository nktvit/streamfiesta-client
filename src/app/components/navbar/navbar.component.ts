import { Component, Input, OnInit } from '@angular/core';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { RouterLink, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { LoggerService } from "../../services/logger.service";
import { LogoutButtonComponent } from '../logout-button/logout-button.component';
import {PbManagerService} from "../../services/pbmanager.service"

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    SearchBoxComponent,
    RouterLink,
    NgIf,
    NgClass,
    LogoutButtonComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() showSearchBox: boolean = false
  isOpenMenu: boolean = false
  currentPage = "/"

  constructor(
    private router: Router,
    private logger: LoggerService,
    public pbManager: PbManagerService
  ) { }

  ngOnInit(): void {
    this.currentPage = this.router.url
    this.logger.log(this.currentPage)
  }
}
