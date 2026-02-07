import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export type Language = string;

export interface LanguageOption {
  code: Language;
  label: string;
  flagUrl: string;
}

/**
 * HeaderComponent
 *
 * Main navigation header with:
 * - Brand/Logo
 * - Search functionality
 * - Language selection
 * - Dark theme toggle
 *
 * @example
 * <app-header
 *   [searchQuery]="searchQuery()"
 *   [currentLanguage]="currentLanguage()"
 *   (onSearchChange)="handleSearch($event)"
 *   (onLanguageChange)="handleLanguageChange($event)">
 * </app-header>
 */
@Component({
  selector: 'app-header',
  template: `
    <header role="banner" class="header">
      <div class="header__container">
        <!-- Brand -->
        <div class="header__brand">
          <h1 class="header__brand-text">{{ 'header.brand' | translate }}</h1>
        </div>

        <!-- Search Field -->
        <div class="header__search">
          <svg class="header__search-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <input
            type="search"
            class="header__search-input"
            [placeholder]="'header.searchPlaceholder' | translate"
            [value]="searchQuery()"
            (input)="handleSearchInput($event)"
            [attr.aria-label]="'header.searchPlaceholder' | translate"
          />
        </div>

        <!-- Actions -->
        <div class="header__actions">
          <!-- Language Selector -->
          <div class="header__localization">
            <button
              type="button"
              class="header__icon-btn"
              (click)="toggleLanguageMenu()"
              [attr.aria-expanded]="isLanguageMenuOpen()"
              [attr.aria-label]="'header.language' | translate">
              <img class="header__flag" [src]="getCurrentLanguageFlag()" alt="" aria-hidden="true" />
            </button>
            @if (isLanguageMenuOpen()) {
              <div class="header__dropdown" role="menu">
                @for (lang of languages; track lang.code) {
                  <button
                    type="button"
                    class="header__dropdown-item"
                    [class.active]="(translate.currentLang === lang.code)"
                    (click)="selectLanguage(lang.code)"
                    role="menuitem">
                    <img class="flag" [src]="lang.flagUrl" [alt]="lang.label" />
                    <span>{{ lang.label }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Theme Toggle -->
          <button
            type="button"
            class="header__icon-btn header__icon-btn--theme-fixed"
            (click)="toggleDarkTheme()"
            [attr.aria-label]="'header.themeToggle' | translate"
            [attr.title]="'header.themeToggle' | translate">
            @if (isDarkMode()) {
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="4" fill="currentColor"/>
                <path d="M10 1v2M10 17v2M18 10h-2M4 10H2M15.66 4.34l-1.41 1.41M5.75 14.25l-1.41 1.41M15.66 15.66l-1.41-1.41M5.75 5.75L4.34 4.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            } @else {
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M17 11.5A7 7 0 0 1 8.5 3 7 7 0 1 0 17 11.5z" fill="currentColor"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class HeaderComponent {
  searchQuery = input('');
  currentLanguage = input<Language>('en');

  translate = inject(TranslateService);

  onSearchChange = output<string>();
  onLanguageChange = output<Language>();

  isLanguageMenuOpen = signal(false);
  isDarkMode = signal(false);

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', flagUrl: 'https://flagcdn.com/w20/gb.png' },
    { code: 'ua', label: 'Українська', flagUrl: 'https://flagcdn.com/w20/ua.png' },
  ];

  constructor() {
    this.initializeDarkMode();

    // Apply dark mode class whenever isDarkMode signal changes
    effect(() => {
      this.applyDarkMode(this.isDarkMode());
    });
  }

  /**
   * Initialize dark mode from localStorage or system preference
   */
  private initializeDarkMode(): void {
    const stored = localStorage.getItem('enumerate-dark-mode');

    if (stored !== null) {
      this.isDarkMode.set(stored === 'true');
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
  }

  /**
   * Apply dark mode by adding/removing theme-dark class to body
   * and persist preference in localStorage
   */
  private applyDarkMode(isDark: boolean): void {
    const body = document.body;

    if (isDark) {
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }

    localStorage.setItem('enumerate-dark-mode', isDark.toString());
  }

  /**
   * Toggle dark theme on/off
   */
  toggleDarkTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.onSearchChange.emit(value);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(open => !open);
  }

  async selectLanguage(lang: Language): Promise<void> {
    await this.translate.use(lang as any);
    localStorage.setItem('denumismat-lang', lang);
    this.onLanguageChange.emit(lang);
    this.isLanguageMenuOpen.set(false);
  }

  getCurrentLanguageFlag(): string {
    const current = this.translate.currentLang || this.translate.getDefaultLang();
    const lang = this.languages.find(l => l.code === current);
    return lang ? lang.flagUrl : 'https://flagcdn.com/w20/gb.png';
  }
}
