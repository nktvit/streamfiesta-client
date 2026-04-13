import { Component } from '@angular/core';
import { initFlowbite } from "flowbite";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  ngOnInit() {
    try {
      initFlowbite();
    } catch (e) {
      console.warn('Flowbite init failed:', e);
    }
  }
}
