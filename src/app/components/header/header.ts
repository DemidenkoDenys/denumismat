import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

export type Language = string;

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
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
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.5 5h-2.55C11.56 5.56 10.84 4.2 10 3.05 12.36 3.52 14.24 5.02 14.5 7zM10 16c-.83-1.15-1.56-2.51-1.95-4h3.9c-.39 1.49-1.12 2.85-1.95 4zM6.05 11C5.88 10.34 5.8 9.68 5.8 9s.08-1.34.25-2h3.9c-.17.66-.25 1.32-.25 2s.08 1.34.25 2H6.05zm.4 2h2.55c.39 1.44 1.11 2.8 1.95 3.95C8.6 16.48 6.72 14.98 6.45 13zm2.55-6H6.45C6.72 5.02 8.6 3.52 10.95 3.05 10.11 4.2 9.39 5.56 9 7zm4.5 0h-2.55c-.39-1.44-1.11-2.8-1.95-3.95C12.4 3.52 14.28 5.02 14.5 7z" fill="currentColor"/>
              </svg>
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
                    <span class="flag">{{ lang.flag }}</span>
                    <span>{{ lang.label }}</span>
                  </button>
                }
              </div>
            }
          </div>

          <!-- Theme Toggle -->
          <button
            type="button"
            class="header__icon-btn"
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
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ua', label: 'Українська', flag: '🇺🇦' },
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
    return lang ? lang.flag : '🇬🇧';
  }
}
