import {Component, Input} from '@angular/core'
import {PbManagerService} from "../../services/pbmanager.service"
import {Router} from "@angular/router"

@Component({
  selector: 'app-logout-button',
  imports: [],
  templateUrl: './logout-button.component.html',
  styleUrl: './logout-button.component.css'
})

export class LogoutButtonComponent {
  @Input() text: string = 'Sign Out';
  @Input() buttonClass: string = 'px-6 py-3 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700';

  constructor(
    private pbManager: PbManagerService,
    private router: Router
  ) {}

  logout(): void {
    this.pbManager.instance.authStore.clear();
    this.router.navigate(['/']);
  }
}
