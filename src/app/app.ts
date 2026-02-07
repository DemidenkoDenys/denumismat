import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { HeaderComponent, type Language } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';
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
      <app-filters (filterChange)="handleFilters($event)"></app-filters>
      <app-coin-grid (selectedSummary)="handleSelectionSummary($event)"></app-coin-grid>
      <app-footer [count]="selectedCount()" [totalWeight]="selectedWeight()"></app-footer>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeaderComponent, IntroductionComponent, FiltersComponent, CoinGridComponent, FooterComponent]
})
export class App {
  searchQuery = signal('');
  currentLanguage = signal<Language>('en');
  selectedCount = signal(0);
  selectedWeight = signal(0);

  handleSearch(query: string): void {
    this.searchQuery.set(query);
    // TODO: Dispatch search action to store
  }

  handleLanguageChange(lang: Language): void {
    this.currentLanguage.set(lang);
    // TODO: Update i18n and persist language preference
  }

  handleFilters(filters: any): void {
    // Placeholder: dispatch to store or update local signals
    console.log('Filters changed', filters);
  }

  handleSelectionSummary(summary: { ids: string[]; totalWeight: number }) {
    this.selectedCount.set(summary.ids.length);
    this.selectedWeight.set(Math.round(summary.totalWeight));
  }
}
