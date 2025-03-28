import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {PbManagerService} from "../services/pbmanager.service"

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private pbManager: PbManagerService, private router: Router) {}

  canActivate(): boolean {
    if (this.pbManager.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/signin']);
    return false;
  }
}
