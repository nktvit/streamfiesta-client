import { Component, inject } from '@angular/core';
import { initFlowbite } from "flowbite";
import { RouterLink, RouterOutlet } from '@angular/router';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  currentYear = new Date().getFullYear();
  private nav = inject(NavigationService);

  ngOnInit() {
    this.nav.init();
    try {
      initFlowbite();
    } catch (e) {
      console.warn('Flowbite init failed:', e);
    }
  }
}
