import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <div class="action-footer" role="region" aria-live="polite">
        <div class="action-footer__inner">
          <div class="action-footer__metrics">
            <span class="action-footer__count">Selected: {{ count() }}</span>
            <span class="action-footer__weight">Total weight: {{ totalWeight() }} g</span>
          </div>

          <div class="action-footer__actions">
            <button class="btn btn--ghost" (click)="handleBook()">Book</button>
            <button class="btn btn--primary" (click)="handleOrder()">Order</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class FooterComponent {
  count = input<number>(0);
  totalWeight = input<number>(0);

  onBook = output<void>();
  onOrder = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
}
