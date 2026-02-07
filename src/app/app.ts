import { Component, ChangeDetectionStrategy, signal, ViewChild } from '@angular/core';
// Note: TranslateModule is configured in bootstrap providers (main.ts)
import { HeaderComponent, type Language } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';
import { SelectionBarComponent } from './components/selection-bar/selection-bar';

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
      <app-filters [selectedCount]="selectedCount()" (filterChange)="handleFilters($event)"></app-filters>
      <app-coin-grid #coinGrid [filters]="filters()" (selectedSummary)="handleSelectionSummary($event)"></app-coin-grid>
      <app-selection-bar [count]="selectedCount()" [totalWeight]="selectedWeight()" (onReset)="handleReset()"></app-selection-bar>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    IntroductionComponent,
    FiltersComponent,
    CoinGridComponent,
    SelectionBarComponent,

  ]
})
export class App {
  @ViewChild('coinGrid') coinGrid: any;
  searchQuery = signal('');
  currentLanguage = signal<Language>('en');
  selectedCount = signal(0);
  selectedWeight = signal(0);
  filters = signal<any>(null);

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
  }

  handleSelectionSummary(summary: { ids: string[]; totalWeight: number }) {
    this.selectedCount.set(summary.ids.length);
    this.selectedWeight.set(Math.round(summary.totalWeight));
  }

  handleReset() {
    if (this.coinGrid) {
      this.coinGrid.resetTrigger.update((v: number) => v + 1);
    }
  }
}
