import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PricePipe } from '../../pipes/price.pipe';
import { selectIsSelectionLimitReached, selectSelectedCoinsCount, selectSelectedCoinsDiscountPrice, selectSelectedCoinsPrice } from '../../state/coins.selectors';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'user-selection-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selectedCoinsCount()) {
      <div class="selection-bar" role="region" aria-live="polite">
        <div class="selection-bar__inner">
          <div class="selection-bar__metrics">
            @if (selectionLimitReached()) {
              <span role="img" class="selection-bar__limit-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#F59E0B"/>
                  <path d="M12 9v4" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12 17h.01" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <div class="tooltip top" role="tooltip">Hello</div>
              </span>
            }

            <span class="selection-bar__count">
              {{ 'selectionBar.selected' | translate:{ count: selectedCoinsCount() } }}&nbsp;&nbsp;&nbsp;

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
export class UserSelectionBarComponent {
  private store = inject(Store);

  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  totalPrice = toSignal(this.store.select(selectSelectedCoinsPrice), { initialValue: 0 });
  totalDiscountPrice = toSignal(this.store.select(selectSelectedCoinsDiscountPrice), { initialValue: 0 });
  selectedCoinsCount = toSignal(this.store.select(selectSelectedCoinsCount), { initialValue: 0 });
  selectionLimitReached = toSignal(this.store.select(selectIsSelectionLimitReached));

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
