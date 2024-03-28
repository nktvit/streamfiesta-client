import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, MatPaginatorModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() totalResults: number = 0;
  @Output() pageChanged = new EventEmitter<number>();
  totalPages: number = 0;
  currentPage: number = 1;

  readonly itemsPerPage: number = 10;
  pages: any[] = [];
  private initialPageSet: boolean = false;
  private routeSubscription?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializePagination();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalResults']) {
      this.initializePagination();
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private initializePagination(): void {
    this.totalPages = Math.ceil(this.totalResults / this.itemsPerPage);
    this.generatePagesArray();

    if (!this.initialPageSet) {
      this.routeSubscription = this.route.queryParams.subscribe(params => {
        this.currentPage = +params['page'] || 1;
        // this.pageChanged.emit(this.currentPage);
        this.initialPageSet = true;
      });
    }
  }

  private generatePagesArray(): void {
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  paginate(e: any): void {
    this.currentPage = e.pageIndex+1;
    this.pageChanged.emit(e.pageIndex+1);
  }
}
