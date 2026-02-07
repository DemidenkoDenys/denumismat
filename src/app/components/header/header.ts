import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type Language = 'en' | 'ro' | 'de' | 'fr';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-header',
  template: `
    <header role="banner" class="header">
      <div class="header__container">
        <!-- Brand with Shimmer Effect -->
        <div class="header__brand">
          <h1 class="header__brand-text">Denumismat</h1>
        </div>

        <!-- Search Field -->
        <div class="header__search">
          <input
            type="search"
            class="header__search-input"
            placeholder="Search coins..."
            [value]="searchQuery()"
            (input)="handleSearchInput($event)"
            aria-label="Search coins"
          />
          <span class="header__search-icon" aria-hidden="true">🔍</span>
        </div>

        <!-- Language Selector -->
        <div class="header__localization">
          <button
            type="button"
            class="header__language-btn"
            (click)="toggleLanguageMenu()"
            [attr.aria-expanded]="isLanguageMenuOpen()"
            aria-label="Select language">
            {{ getCurrentLanguageFlag() }}
          </button>
          @if (isLanguageMenuOpen()) {
            <div class="header__language-menu" role="menu">
              @for (lang of languages; track lang.code) {
                <button
                  type="button"
                  class="header__language-option"
                  [class.active]="currentLanguage() === lang.code"
                  (click)="selectLanguage(lang.code)"
                  role="menuitem">
                  {{ lang.flag }} {{ lang.label }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HeaderComponent {
  searchQuery = input('');
  currentLanguage = input<Language>('en');

  onSearchChange = output<string>();
  onLanguageChange = output<Language>();

  isLanguageMenuOpen = signal(false);

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ro', label: 'Română', flag: '🇷🇴' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onSearchChange.emit(value);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(open => !open);
  }

  selectLanguage(lang: Language): void {
    this.onLanguageChange.emit(lang);
    this.isLanguageMenuOpen.set(false);
  }

  getCurrentLanguageFlag(): string {
    const lang = this.languages.find(l => l.code === this.currentLanguage());
    return lang ? lang.flag : '🇬🇧';
  }
}
