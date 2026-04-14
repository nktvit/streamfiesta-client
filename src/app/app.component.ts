import { Component, inject } from '@angular/core';
import { initFlowbite } from "flowbite";
import { RouterOutlet } from '@angular/router';
import { NavigationService } from './services/navigation.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
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
