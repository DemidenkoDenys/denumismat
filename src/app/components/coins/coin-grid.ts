import { Component, ChangeDetectionStrategy, signal, output, effect, inject, untracked, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import type { OnInit } from '@angular/core';
import { input, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { CoinCardComponent, Coin } from './coin-card';
import { TranslateModule } from '@ngx-translate/core';
import { selectCoins, selectSelectedCoins, selectSelectedCoinIds } from '../../state/coins.selectors';
import * as CoinsActions from '../../state/coins.actions';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';
import { ObserveVisibilityDirective } from '../../directives/in-viewport.directive';
import { IndexedDbService } from '../../services/indexed-db.service';
import { selectIsAdmin } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-coin-grid',
  standalone: true,
  imports: [CommonModule, CoinCardComponent, TranslateModule, ObserveVisibilityDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="coin-grid" [attr.aria-label]="'grid.ariaLabel' | translate">
      <div class="coin-grid__list">
        @for (coin of paginatedCoins(); track coin.id) {
          <app-coin-card
            appObserveVisibility (visible)="onInViewport(coin)"
            [coin]="coin"
            [selected]="selectedIdsSet().has(coin.id)"
            [conversionRate]="conversionRate()"
            [currencyFormat]="currencyFormat()"
            (selectedChange)="onSelect(coin.id, $event)"
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
  private indexedDb = inject(IndexedDbService);
  private selectionRestored = false;

  coins = toSignal(this.store.select(selectCoins), { initialValue: [] });
  isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });
  countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  extinctCountries = toSignal(this.store.select(selectExtinctCountries), { initialValue: null });
  selectedCoins = toSignal(this.store.select(selectSelectedCoins), { initialValue: {} });
  selectedIds = toSignal(this.store.select(selectSelectedCoinIds), { initialValue: [] });

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

  selectedIdsSet = computed(() => new Set(this.selectedIds()));
  selectedSummary = output<{ ids: string[]; totalWeight: number; totalPrice: number; totalDiscountPrice: number }>();
  priceBoundsChange = output<[number, number]>();
  resetTrigger = signal<number>(0);
  filters = input<any>(null);
  searchQuery = input<string>('');
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  visibleCoins = computed(() => {
    const filters = this.filters();
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
      if (filters) {
        if (filters.selectedOnly && !this.selectedIdsSet().has(coin.id)) {
          return false;
        }

        if (filters.priceRange) {
          const [min, max] = filters.priceRange;
          if (coin.price < min || coin.price > max) return false;
        }

        if (filters.tags && filters.tags.length > 0) {
          // Coin must have at least one of the selected tags
          const coinTags = coin.tags || [];
          const hasMatchingTag = filters.tags.some((tag: string) => coinTags.includes(tag));
          if (!hasMatchingTag) return false;
        }

        if (filters.country) {
          if (coin.country !== filters.country) return false;
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
    const coin = this.coins()?.find(c => c.id === id);
    if (!coin) return;

    // prevent selecting booked coins
    if (!this.isAdmin() && coin.booked_at) return;

    if (selected) {
      this.store.dispatch(CoinsActions.selectCoin({ coin }));
    } else {
      this.store.dispatch(CoinsActions.deselectCoin({ coinId: id }));
    }

    // Emit summary for UI updates
    const currentSelectedIds = this.selectedIds();
    const newIds = selected
      ? [...currentSelectedIds, id]
      : currentSelectedIds.filter(selectedId => selectedId !== id);

    this.emitSummary(newIds);
  }

  onInViewport(coin: any) {
    if (!coin || !coin.id) return;
    // persist viewed coin id into IndexedDB via service
    this.indexedDb.markViewed(coin.id).catch(err => console.error('indexedDb.markViewed failed', err));
  }

  showMore() {
    this.displayLimit.update(limit => limit + 30);
  }

  clearSelection() {
    this.store.dispatch(CoinsActions.clearSelection());
    this.selectedSummary.emit({ ids: [], totalWeight: 0, totalPrice: 0, totalDiscountPrice: 0 });
  }

  private restoreSelection() {
    if (!isPlatformBrowser(this.platformId)) return;
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return;
    try {
      const idsMap = JSON.parse(stored);
      if (typeof idsMap !== 'object' || idsMap === null) return;

      const coins = this.coins();
      if (!coins || coins.length === 0) return;

      // Convert map back to array of valid IDs and dispatch select actions
      const validIds = Object.keys(idsMap).filter((id: string) =>
        idsMap[id] === true && coins.some(c => c.id === id)
      );

      if (validIds.length > 0) {
        // Dispatch select actions for each valid coin
        validIds.forEach(id => {
          const coin = coins.find(c => c.id === id);
          if (coin) {
            this.store.dispatch(CoinsActions.selectCoin({ coin }));
          }
        });
        this.emitSummary(validIds);
      }
    } catch {
      // Clear any corrupted data
      this.store.dispatch(CoinsActions.clearSelection());
    }
  }

  private persistSelection(ids: string[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    // Convert array to map for faster lookups
    const idsMap = ids.reduce((map, id) => {
      map[id] = true;
      return map;
    }, {} as Record<string, boolean>);
    localStorage.setItem(this.storageKey, JSON.stringify(idsMap));
  }

  private emitSummary(ids: string[]) {
    const coins = this.coins();
    if (!coins) {
      this.selectedSummary.emit({ ids: [], totalWeight: 0, totalPrice: 0, totalDiscountPrice: 0 });
      return;
    }
    const selected = coins.filter(c => ids.includes(c.id));
    const totalPrice = selected.reduce((sum, c) => sum + (c.price || 0), 0);
    const totalDiscountPrice = selected.reduce((sum, c) => sum + (c.discountPrice || 0), 0);
    this.selectedSummary.emit({ ids, totalWeight: 0, totalPrice, totalDiscountPrice });
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
