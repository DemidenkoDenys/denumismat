import { Component, ChangeDetectionStrategy, signal, output, effect } from '@angular/core';
import type { OnInit } from '@angular/core';
import { input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinCardComponent, Coin } from './coin-card';
import { TranslateModule } from '@ngx-translate/core';

function sampleCoins(): Coin[] {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `coin-${i + 1}`,
    name: `Germany - 2 euro - 2007 coin - Schwerin Castle, Mecklenburg-Vorpommern - D`,
    year: 1900 + i,
    price: Number((0.1 + Math.random() * (115 - 0.1)).toFixed(2)),
    weight: Math.round(5 + Math.random() * 30),
    description: 'A fine example of historical minting, well preserved with attractive patina.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
    category: ['UNC', 'Rare', 'Sale'],
    country: 'Unknown',
    isBooked: false,
  }));
}

@Component({
  selector: 'app-coin-grid',
  standalone: true,
  imports: [CommonModule, CoinCardComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="coin-grid" [attr.aria-label]="'grid.ariaLabel' | translate">
      <div class="coin-grid__list">
        @for (c of visibleCoins(); track c.id) {
          <app-coin-card
            [coin]="c"
            [selected]="selectedIds().includes(c.id)"
            (selectedChange)="onSelect(c.id, $event)">
          </app-coin-card>
        }
      </div>
    </section>
  `,
})
export class CoinGridComponent implements OnInit {
  private readonly storageKey = 'denumismat.selectedCoinIds';
  coins = signal<Coin[]>(sampleCoins());
  selectedIds = signal<string[]>([]);
  selectedSummary = output<{ ids: string[]; totalWeight: number; totalPrice: number }>();
  priceBoundsChange = output<[number, number]>();
  resetTrigger = signal<number>(0);
  filters = input<any>(null);

  visibleCoins = computed(() => {
    const f = this.filters();
    const allCoins = this.coins();

    if (!f) return allCoins;

    return allCoins.filter(coin => {
      if (f.selectedOnly && !this.selectedIds().includes(coin.id)) {
        return false;
      }

      if (f.tags && f.tags.length > 0) {
        const hasTags = f.tags.some((tag: string) => coin.category.includes(tag));
        if (!hasTags) return false;
      }

      if (f.country) {
        const countryMatch = coin.country.toLowerCase().includes(f.country.toLowerCase());
        if (!countryMatch) return false;
      }

      if (f.priceRange) {
        const [min, max] = f.priceRange;
        if (coin.price < min || coin.price > max) return false;
      }

      return true;
    });
  });

  constructor() {
    effect(() => {
      if (this.resetTrigger() > 0) {
        this.clearSelection();
      }
    });
  }

  ngOnInit(): void {
    this.emitPriceBounds();
    this.restoreSelection();
  }

  onSelect(id: string, selected: boolean) {
    const set = new Set(this.selectedIds());
    if (selected) set.add(id);
    else set.delete(id);
    const ids = Array.from(set);
    this.selectedIds.set(ids);
    this.persistSelection(ids);
    this.emitSummary(ids);
  }

  clearSelection() {
    this.selectedIds.set([]);
    this.persistSelection([]);
    this.selectedSummary.emit({ ids: [], totalWeight: 0, totalPrice: 0 });
  }

  private restoreSelection() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return;
    try {
      const ids = JSON.parse(stored);
      if (!Array.isArray(ids)) return;
      const validIds = ids.filter((id: unknown) =>
        typeof id === 'string' && this.coins().some(c => c.id === id)
      );
      if (validIds.length === 0) return;
      this.selectedIds.set(validIds);
      this.emitSummary(validIds);
    } catch {
      this.persistSelection([]);
    }
  }

  private persistSelection(ids: string[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(ids));
  }

  private emitSummary(ids: string[]) {
    const selected = this.coins().filter(c => ids.includes(c.id));
    const totalWeight = selected.reduce((sum, c) => sum + (c.weight || 0), 0);
    const totalPrice = selected.reduce((sum, c) => sum + (c.price || 0), 0);
    this.selectedSummary.emit({ ids, totalWeight, totalPrice });
  }

  private emitPriceBounds() {
    const prices = this.coins()
      .map(c => c.price)
      .filter(price => Number.isFinite(price));
    if (prices.length === 0) return;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    this.priceBoundsChange.emit([Number(min.toFixed(2)), Number(max.toFixed(2))]);
  }
}
