import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
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
              <span class="selection-bar__price">({{ totalPrice() | currency:'USD':'symbol':'1.0-2' }})</span>
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

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
