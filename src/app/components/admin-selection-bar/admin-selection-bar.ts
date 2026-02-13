import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { isCoinSelected, selectSelectedCoins, selectSelectedCoinsCount, selectSelectedCoinsDiscountPrice } from '../../state/coins.selectors';
import { AdminService } from '../../services/admin.service';
import { deselectCoin } from '../../state/coins.actions';

@Component({
  selector: 'admin-selection-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isCoinSelected()) {
      <div class="selection-bar" role="region" aria-live="polite">
        <div class="selection-bar__inner">
          <div class="selection-bar__metrics">
            <span class="selection-bar__count">
              {{ 'selectionBar.selected' | translate:{ count: selectedCoinsCount() } }}&nbsp;&nbsp;&nbsp;
            </span>
          </div>

          <div class="selection-bar__actions">
            <button class="btn btn--ghost" (click)="handleReset()">{{ 'selectionBar.reset' | translate }}</button>
            <button class="btn btn--ghost btn--secondary" (click)="handleUnbook()">{{ 'selectionBar.unbook' | translate }}</button>
            <button class="btn btn--primary btn--danger" (click)="handleOrder()">{{ 'selectionBar.delete' | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminSelectionBarComponent {
  private store = inject(Store);
  private adminService = inject(AdminService);

  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });
  selectedCoins = toSignal(this.store.select(selectSelectedCoins));
  isCoinSelected = toSignal(this.store.select(isCoinSelected), { initialValue: false });
  selectedCoinsCount = toSignal(this.store.select(selectSelectedCoinsCount), { initialValue: 0 });

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  handleUnbook() {
    const coins = this.selectedCoins();

    for (const id in coins) {
      if (coins[id].booked_at) {
        this.adminService.unbookCoin(id);
        this.store.dispatch(deselectCoin({ coinId: coins[id].id }))
      }
    }
  }

  handleOrder() { this.onOrder.emit(); }
  handleReset() { this.onReset.emit(); }
}
