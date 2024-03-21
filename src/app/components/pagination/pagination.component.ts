import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';


@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})

export class PaginationComponent implements OnChanges {
  @Input() totalResults: number = 0;
  @Output() pageChanged = new EventEmitter<number>();
  totalPages: number = 0;
  currentPage: number = 1;

  readonly itemsPerPage: number = 10;
  pages:number[] = []

  ngOnInit(): void {
    this.totalPages = Math.ceil(this.totalResults / this.itemsPerPage);
    this.generatePagesArray();

  }
  generatePagesArray() {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.totalResults / this.itemsPerPage);

    this.currentPage = 1;

    this.pageChanged.emit(this.currentPage);

    this.generatePagesArray();

  }

  paginate(page: number): void {
    this.currentPage = page;
    this.pageChanged.emit(page); // Emit the current page to the parent component
  }
}
