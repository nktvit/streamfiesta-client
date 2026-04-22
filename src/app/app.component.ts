import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationService } from './services/navigation.service';
import { FooterComponent } from './components/footer/footer.component';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: { class: 'block min-h-screen' },
})
export class AppComponent {
  private nav = inject(NavigationService);

  ngOnInit() {
    this.nav.init();
    injectSpeedInsights();
  }
}
