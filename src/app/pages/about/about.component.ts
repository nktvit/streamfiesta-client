import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-about',
  imports: [NavbarComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, OnDestroy {
  ngOnInit() {
    document.body.classList.add('hide-bmc-widget');
  }

  ngOnDestroy() {
    document.body.classList.remove('hide-bmc-widget');
  }
}
