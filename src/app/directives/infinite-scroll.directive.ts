import { Directive, ElementRef, OnInit, OnDestroy, input, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  readonly disabled = input<boolean>(false);
  readonly scrolled = output<void>();

  private observer!: IntersectionObserver;
  // Only emit after the sentinel has been scrolled out of view at least once.
  // This prevents firing immediately when the element first appears in the viewport.
  private hasBeenHidden = false;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        this.hasBeenHidden = true;
      } else if (this.hasBeenHidden && !this.disabled()) {
        this.scrolled.emit();
      }
    });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
