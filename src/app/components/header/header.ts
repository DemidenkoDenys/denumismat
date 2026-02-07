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
        <!-- Brand with Shimmer Effect -->
        <div class="header__brand">
          <h1 class="header__brand-text">{{ 'header.brand' | translate }}</h1>
        </div>

        <!-- Search Field -->
        <div class="header__search">
          <input
            type="search"
            class="header__search-input"
            [placeholder]="'header.searchPlaceholder' | translate"
            [value]="searchQuery()"
            (input)="handleSearchInput($event)"
            [attr.aria-label]="'header.searchPlaceholder' | translate"
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
            [attr.aria-label]="'header.language' | translate">
            {{ getCurrentLanguageFlag() }} {{ 'header.language' | translate }}
          </button>
          @if (isLanguageMenuOpen()) {
            <div class="header__language-menu" role="menu">
              @for (lang of languages; track lang.code) {
                <button
                  type="button"
                  class="header__language-option"
                  [class.active]="(translate.currentLang === lang.code)"
                  (click)="selectLanguage(lang.code)"
                  role="menuitem">
                  {{ lang.flag }} {{ lang.label }}
                </button>
              }
            </div>
          }
        </div>

        <!-- Theme Toggle Button -->
        <button
          type="button"
          class="header__theme-btn"
          (click)="toggleDarkTheme()"
          [attr.aria-label]="'header.themeToggle' | translate"
          [attr.title]="'header.themeToggle' | translate">
          {{ isDarkMode() ? '☀️' : '🌙' }}
        </button>
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
