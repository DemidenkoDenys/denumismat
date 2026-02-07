import { Component, ChangeDetectionStrategy, signal, ViewChild } from '@angular/core';
// Note: TranslateModule is configured in bootstrap providers (main.ts)
import { HeaderComponent, type Language } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';
import { SelectionBarComponent } from './components/selection-bar/selection-bar';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  template: `
    <app-header
      [searchQuery]="searchQuery()"
      [currentLanguage]="currentLanguage()"
      (onSearchChange)="handleSearch($event)"
      (onLanguageChange)="handleLanguageChange($event)">
    </app-header>

    <main>
      <app-introduction></app-introduction>
      <app-filters
        [selectedCount]="selectedCount()"
        [priceBounds]="priceBounds()"
        [priceRange]="priceRange()"
        (filterChange)="handleFilters($event)">
      </app-filters>
      <app-coin-grid
        #coinGrid
        [filters]="filters()"
        (selectedSummary)="handleSelectionSummary($event)"
        (priceBoundsChange)="handlePriceBoundsChange($event)">
      </app-coin-grid>
      <app-selection-bar
        [count]="selectedCount()"
        [totalWeight]="selectedWeight()"
        [totalPrice]="selectedPrice()"
        (onReset)="handleReset()"></app-selection-bar>
    </main>
    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    IntroductionComponent,
    FiltersComponent,
    CoinGridComponent,
    SelectionBarComponent,
    FooterComponent,

  ]
})
export class App {
  @ViewChild('coinGrid') coinGrid: any;
  searchQuery = signal('');
  currentLanguage = signal<Language>('en');
  selectedCount = signal(0);
  selectedWeight = signal(0);
  selectedPrice = signal(0);
  filters = signal<any>(null);
  priceBounds = signal<[number, number]>([0, 10000]);
  priceRange = signal<[number, number]>([0, 10000]);

  handleSearch(query: string): void {
    this.searchQuery.set(query);
    // TODO: Dispatch search action to store
  }

  handleLanguageChange(lang: Language): void {
    this.currentLanguage.set(lang);
    // TODO: Update i18n and persist language preference
  }

  handleFilters(filters: any): void {
    this.filters.set(filters);
    if (filters?.priceRange) {
      this.priceRange.set(filters.priceRange);
    }
  }

  handleSelectionSummary(summary: { ids: string[]; totalWeight: number; totalPrice: number }) {
    this.selectedCount.set(summary.ids.length);
    this.selectedWeight.set(Math.round(summary.totalWeight));
    this.selectedPrice.set(Number(summary.totalPrice.toFixed(2)));
  }

  handlePriceBoundsChange(bounds: [number, number]) {
    this.priceBounds.set(bounds);
    const [currentMin, currentMax] = this.priceRange();
    const [min, max] = bounds;
    if (currentMin < min || currentMax > max || (currentMin === 0 && currentMax === 10000)) {
      this.priceRange.set([min, max]);
    }
  }

  handleReset() {
    if (this.coinGrid) {
      this.coinGrid.resetTrigger.update((v: number) => v + 1);
    }
  }
}
