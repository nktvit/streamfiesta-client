import { Component } from '@angular/core';
import { initFlowbite } from "flowbite";

import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'movie-streamer';

  ngOnInit() {
    initFlowbite();
  }
}
