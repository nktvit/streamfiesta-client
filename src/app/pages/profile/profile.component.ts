import {Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {AsyncPipe, NgIf} from "@angular/common";
import {NavbarComponent} from "../../components/navbar/navbar.component";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-profile',
  imports: [
    AsyncPipe,
    NgIf,
    NavbarComponent
  ],
  templateUrl: './profile.component.html',
  standalone: true,
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(public auth: AuthService, public user: UserService) {
  }

}
