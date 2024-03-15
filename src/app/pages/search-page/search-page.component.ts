import { Component } from '@angular/core';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';
import { MoviesGridComponent } from '../../components/movies-grid/movies-grid.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [SearchBoxComponent, MoviesGridComponent],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {

}
