import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { HeaderComponent, type Language } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';

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
      <app-coin-grid></app-coin-grid>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeaderComponent, IntroductionComponent, FiltersComponent, CoinGridComponent]
})
export class App {
  searchQuery = signal('');
  currentLanguage = signal<Language>('en');

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
}
