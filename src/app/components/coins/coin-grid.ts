import { Component, ChangeDetectionStrategy, signal, output, effect, inject, untracked, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import type { OnInit } from '@angular/core';
import { input, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoinCardComponent, Coin } from './coin-card';
import { TranslateModule } from '@ngx-translate/core';
import { selectCoins } from '../../state/coins.selectors';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';

@Component({
  selector: 'app-coin-grid',
  standalone: true,
  imports: [CommonModule, CoinCardComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="coin-grid" [attr.aria-label]="'grid.ariaLabel' | translate">
      <div class="coin-grid__list">
        @for (c of paginatedCoins(); track c.id) {
          <app-coin-card
            [coin]="c"
            [selected]="selectedIds().includes(c.id)"
            [conversionRate]="conversionRate()"
            [currencyFormat]="currencyFormat()"
            (selectedChange)="onSelect(c.id, $event)"
            (openSliderModal)="openSliderModal.emit($event)">
          </app-coin-card>
        }
      </div>
      @if (visibleCoins().length > displayLimit()) {
        <div class="coin-grid__actions">
          <button class="coin-grid__show-more" (click)="showMore()">
            {{ 'grid.showMore' | translate }} ({{ paginatedCoins().length }}/{{ visibleCoins().length }})
          </button>
        </div>
      }
    </section>
  `,
})
export class CoinGridComponent implements OnInit {
  private readonly storageKey = 'denumismat.selectedCoinIds';
  private platformId = inject(PLATFORM_ID);
  private store = inject(Store);
  private selectionRestored = false;
  coins = toSignal(this.store.select(selectCoins), { initialValue: [] });
  countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  extinctCountries = toSignal(this.store.select(selectExtinctCountries), { initialValue: null });

  displayLimit = signal(20);

  // Enrich coins with pre-computed searchable title
  enrichedCoins = computed<Coin[]>(() => {
    const allCoins = this.coins();
    const countriesMap = this.countries();
    const extinctsMap = this.extinctCountries();

    if (!allCoins) return [];

    // Merge countries and extinct countries
    const allCountriesMap = { ...countriesMap, ...extinctsMap };

    return allCoins.map(coin => ({
      ...coin,
      title: `${allCountriesMap[coin.country]?.name || coin.country || ''} ${coin.deno} ${coin.year} ${coin.description || ''}`
    }));
  });

  selectedIds = signal<string[]>([]);
  selectedSummary = output<{ ids: string[]; totalWeight: number; totalPrice: number }>();
  priceBoundsChange = output<[number, number]>();
  resetTrigger = signal<number>(0);
  filters = input<any>(null);
  searchQuery = input<string>('');
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  visibleCoins = computed(() => {
    const f = this.filters();
    const allCoins = this.enrichedCoins();
    const search = this.searchQuery();

    if (!allCoins) return [];

    return allCoins.filter(coin => {
      // Apply search query filter
      if (search && search.trim() !== '') {
        const searchText = search.trim();

        // Extract year from search query (3-4 digit number starting with 18, 19, or 20)
        const yearMatch = searchText.match(/\b(18|19|20)\d{1,2}\b/);
        const searchYear = yearMatch ? parseInt(yearMatch[0]) : null;

        // Get remaining text (everything except the year)
        const remainingText = searchText.replace(/\b(18|19|20)\d{1,2}\b/g, '').trim().toLowerCase();

        // Check year match
        if (searchYear !== null && coin.year !== searchYear) {
          return false;
        }

        // Check text match in pre-computed title (if there's remaining text)
        if (remainingText !== '' && !coin.title?.toLowerCase().includes(remainingText)) {
          return false;
        }
      }

      // Apply other filters
      if (f) {
        if (f.selectedOnly && !this.selectedIds().includes(coin.id)) {
          return false;
        }

        if (f.priceRange) {
          const [min, max] = f.priceRange;
          if (coin.price < min || coin.price > max) return false;
        }

        if (f.tags && f.tags.length > 0) {
          // Coin must have at least one of the selected tags
          const coinTags = coin.tags || [];
          const hasMatchingTag = f.tags.some((tag: string) => coinTags.includes(tag));
          if (!hasMatchingTag) return false;
        }
      }

      return true;
    });
  });

  paginatedCoins = computed(() => {
    return this.visibleCoins().slice(0, this.displayLimit());
  });

  @Output() openSliderModal = new EventEmitter<{ coinId: string, alt: string }>();

  constructor() {
    effect(() => {
      const coins = this.coins();
      if (coins && coins.length > 0 && !this.selectionRestored) {
        untracked(() => {
          this.restoreSelection();
          this.selectionRestored = true;
        });
      }
    });

    effect(() => {
      if (this.resetTrigger() > 0) {
        this.clearSelection();
      }
    });

    // Reset pagination when filters change
    effect(() => {
      this.filters();
      this.searchQuery();
      untracked(() => {
        this.displayLimit.set(20);
      });
    });

    // Update price bounds whenever coins data changes
    effect(() => {
      const coins = this.coins();
      if (coins && coins.length > 0) {
        this.emitPriceBounds();
      }
    });
  }

  ngOnInit(): void {
    // Selection restored via effect when coins are loaded
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

  showMore() {
    this.displayLimit.update(limit => limit + 30);
  }

  clearSelection() {
    this.selectedIds.set([]);
    this.persistSelection([]);
    this.selectedSummary.emit({ ids: [], totalWeight: 0, totalPrice: 0 });
  }

  private restoreSelection() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return;
    try {
      const ids = JSON.parse(stored);
      if (!Array.isArray(ids)) return;

      const coins = this.coins();
      if (!coins || coins.length === 0) return;

      // Filter to only include IDs that exist in the current coin set
      const validIds = ids.filter((id: unknown) =>
        typeof id === 'string' && coins.some(c => c.id === id)
      );

      if (validIds.length > 0) {
        this.selectedIds.set(validIds);
        this.emitSummary(validIds);
      }
    } catch {
      this.persistSelection([]);
    }
  }

  private persistSelection(ids: string[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.storageKey, JSON.stringify(ids));
  }

  private emitSummary(ids: string[]) {
    const coins = this.coins();
    if (!coins) {
      this.selectedSummary.emit({ ids: [], totalWeight: 0, totalPrice: 0 });
      return;
    }
    const selected = coins.filter(c => ids.includes(c.id));
    const totalPrice = selected.reduce((sum, c) => sum + (c.price || 0), 0);
    this.selectedSummary.emit({ ids, totalWeight: 0, totalPrice });
  }

  private emitPriceBounds() {
    const coins = this.coins();
    if (!coins) return;
    const prices = coins
      .map(c => c.price)
      .filter(price => Number.isFinite(price));
    if (prices.length === 0) return;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    this.priceBoundsChange.emit([Number(min.toFixed(2)), Number(max.toFixed(2))]);
  }
}
