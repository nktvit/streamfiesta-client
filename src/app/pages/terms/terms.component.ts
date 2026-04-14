import { Component, inject, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-terms',
  imports: [NavbarComponent, RouterLink],
  templateUrl: './terms.component.html',
})
export class TermsComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('Terms & Conditions | Stream Fiesta');
    this.metaService.updateTag({ name: 'description', content: 'Terms and Conditions for Stream Fiesta — disclaimer, copyright, and usage policies.' });
  }
}
