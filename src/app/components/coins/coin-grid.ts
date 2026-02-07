import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoinCardComponent, Coin } from './coin-card';

function sampleCoins(): Coin[] {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `coin-${i + 1}`,
    name: `Coin ${i + 1}`,
    year: 1900 + i,
    price: Math.round(100 + Math.random() * 1000),
    weight: Math.round(5 + Math.random() * 30),
    description: 'A fine example of historical minting, well preserved with attractive patina.',
    imageUrl: 'https://www.madebycooper.co.uk/images/jcogs_img/cache/single-sided-coins-custom-coins_-_28de80_-_372a6c1f6fb5760c84ac71ed415b711539031866.jpeg',
    highResUrl: 'https://www.madebycooper.co.uk/images/jcogs_img/cache/single-sided-coins-star-wars-grogu-custom-challenge-coin_-_28de80_-_804d2219bf6b2608ca1a39797f1ebaf8bad035bf.png',
    category: ['UNC'],
    country: 'Unknown',
    isBooked: false,
  }));
}

@Component({
  selector: 'app-coin-grid',
  standalone: true,
  imports: [CommonModule, CoinCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="coin-grid" aria-label="Coin grid">
      <div class="coin-grid__list">
        @for (c of coins(); track c.id) {
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
}
