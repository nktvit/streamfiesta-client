import { Component } from '@angular/core';
import { MoviesGridComponent } from '../../components/movies-grid/movies-grid.component';
import { SearchBoxComponent } from '../../components/search-box/search-box.component';

@Component({
    selector: 'app-main',
    standalone: true,
    templateUrl: './main.component.html',
    styleUrl: './main.component.css',
    imports: [SearchBoxComponent, MoviesGridComponent]
})
export class MainComponent {

}
