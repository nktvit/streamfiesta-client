import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-about',
  imports: [NavbarComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit, OnDestroy {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit() {
    this.titleService.setTitle('About | Stream Fiesta');
    this.metaService.updateTag({ name: 'description', content: 'About Stream Fiesta — your free movie and TV streaming platform.' });
    document.body.classList.add('hide-bmc-widget');
  }

  ngOnDestroy() {
    document.body.classList.remove('hide-bmc-widget');
  }
}
