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
      <div class="selection-bar" role="region" aria-live="polite">
        <div class="selection-bar__inner">
          <div class="selection-bar__metrics">
            <span class="selection-bar__count">
              {{ 'selectionBar.selected' | translate:{ count: selectedCoinsCount() } }}&nbsp;&nbsp;&nbsp;
            </span>
          </div>

          <div class="selection-bar__actions">
            <button class="btn btn--ghost" (click)="handleReset()" [disabled]="!isCoinSelected()">{{ 'selectionBar.reset' | translate }}</button>
            <button class="btn btn--ghost btn--secondary" (click)="handleRestore()" [disabled]="!isCoinSelected()">{{ 'selectionBar.restore' | translate }}</button>
            <button class="btn btn--primary btn--danger" (click)="handleDelete()" [disabled]="!isCoinSelected()">{{ 'selectionBar.delete' | translate }}</button>
          </div>
        </div>
      </div>
  `,
})
export class AdminSelectionBarComponent {
  private store = inject(Store);
  private adminService = inject(AdminService);

  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });
  selectedCoins = toSignal(this.store.select(selectSelectedCoins));
  isCoinSelected = toSignal(this.store.select(selectSelectedCoinsCount));
  selectedCoinsCount = toSignal(this.store.select(selectSelectedCoinsCount), { initialValue: 0 });

  onBook = output<void>();
  onOrder = output<void>();
  onReset = output<void>();

  handleRestore() {
    const coins = this.selectedCoins();

    for (const id in coins) {
      this.adminService.restoreCoin(id);
      this.store.dispatch(deselectCoin({ coinId: coins[id].id }))
    }
  }

  handleDelete() {
    const coins = this.selectedCoins();

    for (const id in coins) {
      this.adminService.deleteCoin(id);
      this.store.dispatch(deselectCoin({ coinId: coins[id].id }))
    }
  }

  handleReset() { this.onReset.emit(); }
}
