import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-selection-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <div class="selection-bar" role="region" aria-live="polite">
        <div class="selection-bar__inner">
          <div class="selection-bar__metrics">
            <span class="selection-bar__count">
              {{ 'selectionBar.selected' | translate:{ count: count() } }}
              <span class="selection-bar__price">({{ formattedPrice() }})</span>
            </span>
            <span class="selection-bar__weight">
              <span class="selection-bar__weight-label">{{ 'selectionBar.totalWeightLabel' | translate }}</span>
              <span class="selection-bar__weight-value">{{ totalWeight() }}</span>
              <span class="selection-bar__weight-unit">{{ 'selectionBar.totalWeightUnit' | translate }}</span>
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
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  formattedPrice = computed(() => {
    const price = this.totalPrice().toFixed(2);
    const format = this.currencyFormat();
    const currency = format.short;
    // Add thousands separator (space)
    const [intPart, decPart] = price.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedPrice = `${formattedInt}.${decPart}`;
    return format.start ? `${currency} ${formattedPrice}` : `${formattedPrice} ${currency}`;
  });

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
