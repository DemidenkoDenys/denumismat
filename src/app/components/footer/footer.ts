import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (count() > 0) {
      <div class="action-footer" role="region" aria-live="polite">
        <div class="action-footer__inner">
          <div class="action-footer__metrics">
            <span class="action-footer__count">{{ 'footer.selected' | translate:{ count: count() } }}</span>
            <span class="action-footer__weight">
              <span class="action-footer__weight-label">{{ 'footer.totalWeightLabel' | translate }}</span>
              <span class="action-footer__weight-value">{{ totalWeight() }}</span>
              <span class="action-footer__weight-unit">{{ 'footer.totalWeightUnit' | translate }}</span>
            </span>
          </div>

          <div class="action-footer__actions">
            <button class="btn btn--ghost" (click)="handleReset()">{{ 'footer.reset' | translate }}</button>
            <button class="btn btn--ghost" (click)="handleBook()">{{ 'footer.book' | translate }}</button>
            <button class="btn btn--primary" (click)="handleOrder()">{{ 'footer.order' | translate }}</button>
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
  onReset = output<void>();

  // wire template clicks to outputs
  handleBook() { this.onBook.emit(); }
  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
