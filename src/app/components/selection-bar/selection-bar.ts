import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-selection-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <div class="selection-bar" role="region" aria-live="polite">
        <div class="selection-bar__inner">
          <div class="selection-bar__metrics">
            <span class="selection-bar__count">
              {{ 'selectionBar.selected' | translate:{ count: count() } }}&nbsp;&nbsp;&nbsp;
              <span class="selection-bar__price">
                <span class="selection-bar__original-price">{{ totalPrice() | price: false }}</span>&nbsp;&nbsp;
                <span class="selection-bar__discounted-price">{{ 'coin.price' | translate:{ price: (totalDiscountPrice() | price) } }}</span>
              </span>
            </span>
          </div>

          <div class="selection-bar__actions">
            <button class="btn btn--ghost" (click)="handleReset()">{{ 'selectionBar.reset' | translate }}</button>
            <button class="btn btn--ghost" (click)="handleBook()">{{ 'selectionBar.book' | translate }}</button>
            <button class="btn btn--primary" (click)="handleOrder()">{{ 'selectionBar.order' | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SelectionBarComponent {
  count = input<number>(0);
  totalWeight = input<number>(0);
  totalPrice = input<number>(0);
  totalDiscountPrice = input<number>(0);
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
