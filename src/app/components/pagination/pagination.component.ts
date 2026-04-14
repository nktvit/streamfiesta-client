import { Component, inject, input, output, OnChanges, SimpleChanges, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnChanges {
  readonly totalResults = input<number>(0);
  readonly pageChanged = output<number>();
  totalPages: number = 0;
  currentPage: number = 1;

  readonly itemsPerPage: number = 10;
  private initialPageSet: boolean = false;
  private routeSubscription?: Subscription;

  private route = inject(ActivatedRoute);

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
    this.totalPages = Math.ceil(this.totalResults() / this.itemsPerPage);

    if (!this.initialPageSet) {
      this.routeSubscription = this.route.queryParams.subscribe(params => {
        this.currentPage = +params['page'] || 1;
        this.initialPageSet = true;
      });
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.pageChanged.emit(page);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
