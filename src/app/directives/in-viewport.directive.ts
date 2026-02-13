import { AfterViewInit, Directive, ElementRef, EventEmitter, Output } from "@angular/core";

@Directive({
  selector: '[appObserveVisibility]',
  standalone: true
})
export class ObserveVisibilityDirective implements AfterViewInit {
  @Output() visible = new EventEmitter<void>();

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.visible.emit();
        observer.disconnect();
      }
    });

    observer.observe(this.el.nativeElement);
  }
}
