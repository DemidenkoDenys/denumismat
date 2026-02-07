import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, type Language } from './components/header/header';

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
      <router-outlet></router-outlet>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [HeaderComponent, RouterOutlet]
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
}
