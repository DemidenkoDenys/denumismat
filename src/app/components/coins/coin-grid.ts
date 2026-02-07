import { Component, ChangeDetectionStrategy, signal, output, effect } from '@angular/core';
import { input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinCardComponent, Coin } from './coin-card';
import { TranslateModule } from '@ngx-translate/core';

function sampleCoins(): Coin[] {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `coin-${i + 1}`,
    name: `Germany - 2 euro - 2007 coin - Schwerin Castle, Mecklenburg-Vorpommern - D`,
    year: 1900 + i,
    price: Math.round(100 + Math.random() * 1000),
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
export class CoinGridComponent {
  coins = signal<Coin[]>(sampleCoins());
  selectedIds = signal<string[]>([]);
  selectedSummary = output<{ ids: string[]; totalWeight: number }>();
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
      this.resetTrigger();
      this.clearSelection();
    });
  }

  onSelect(id: string, selected: boolean) {
    const set = new Set(this.selectedIds());
    if (selected) set.add(id);
    else set.delete(id);
    this.selectedIds.set(Array.from(set));
    // compute total weight for selected ids
    const ids = Array.from(set);
    const totalWeight = this.coins()
      .filter(c => ids.includes(c.id))
      .reduce((sum, c) => sum + (c.weight || 0), 0);
    this.selectedSummary.emit({ ids, totalWeight });
  }

  clearSelection() {
    this.selectedIds.set([]);
    this.selectedSummary.emit({ ids: [], totalWeight: 0 });
  }
}
