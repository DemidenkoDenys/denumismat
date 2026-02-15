import { Component, ChangeDetectionStrategy, input, output, signal, effect, inject, computed, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectCountries } from '../../state/countries.selectors';
import { selectCurrenciesInfo } from '../../state/currency.selectors';
import { setSelectedCurrency } from '../../state/currency.actions';
import { setSelectedLanguage } from '../../state/countries.actions';
import { CountriesMap } from '../../state/countries.models';
import { selectUser } from '../../state/auth/auth.selectors';
import { logout } from '../../state/auth/auth.actions';
import { ALPHA3_TO_ALPHA2 } from '../../config/country-codes';
import { AuthModalService } from '../../services/auth-modal.service';

export type Language = string;
export type Currency = string;

export interface LanguageOption {
  key: string;
  countryCode: string;
  countryName: string;
  languageCode: Language;
}

export interface CurrencyOption {
  key: string;
  countryCode: string;
  countryName: string;
  currencyCode: Currency;
  symbol: string;
  rate: number;
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
        <div class="header__search" [class.header__search--active]="isSearchActive()">
          <svg class="header__search-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <input
            type="search"
            class="header__search-input"
            [value]="searchQuery()"
            [placeholder]="'header.searchPlaceholder' | translate"
            [attr.aria-label]="'header.searchPlaceholder' | translate"
            (input)="handleSearchInput($event)"
            (focus)="onSearchFocus()"
            (blur)="onSearchBlur()"
          />
        </div>

        <!-- Actions -->
        <div class="header__actions">

          <!-- Auth Google -->
          <div class="header__auth-wrapper">
            @if (currentUser(); as user) {
              <button
                type="button"
                class="header__icon-btn header__auth-btn"
                (click)="onLogout()"
                [attr.aria-label]="user.displayName">
                @if (user.photoURL) {
                   <img [src]="user.photoURL" class="header__auth-avatar" [alt]="user.displayName">
                } @else {
                   <span class="header__auth-initials">{{ user.displayName?.charAt(0)?.toUpperCase() || '?' }}</span>
                }
              </button>
            } @else {
              <button
                type="button"
                class="header__icon-btn header__auth-btn"
                (click)="onLogin()"
                [attr.aria-label]="'header.auth' | translate">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <circle cx="12" cy="10" r="3" fill="currentColor"/>
                  <path d="M7 18c0-2.21 2.24-4 5-4s5 1.79 5 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
              </button>
            }

            <div class="tooltip" role="tooltip">
              @if (currentUser(); as user) {
                {{ user.displayName }}<br>
                {{ user.email }}<br><br>
              }
              {{ (currentUser() ? 'header.logout' : 'header.authTooltip') | translate }}
            </div>
          </div>

          <!-- Currency Selector -->
          <div class="header__localization" #currencyContainer>
            <button
              type="button"
              class="header__icon-btn"
              (click)="toggleCurrencyMenu()"
              [attr.aria-expanded]="isCurrencyMenuOpen()"
              [attr.aria-label]="'header.currency' | translate">
              <span class="header__currency-symbol">{{ getCurrentCurrency().symbol }}</span>
            </button>

            @if (isCurrencyMenuOpen()) {
              <div class="header__dropdown" role="menu">
                @for (currency of mustCurrencies(); track currency.key) {
                  <button
                    type="button"
                    class="header__dropdown-item"
                    [class.active]="(currentCurrencyKey() === currency.key)"
                    (click)="selectCurrency(currency.key)"
                    role="menuitem">
                    <span class="currency-symbol">{{ currency.symbol }}</span>
                    <span>{{ currency.countryName }} ({{ currency.currencyCode }})</span>
                  </button>
                }
                <button
                  type="button"
                  class="header__dropdown-toggle"
                  (click)="toggleCurrencyExpanded()"
                  [attr.aria-expanded]="isCurrencyExpanded()"
                  [attr.aria-label]="'header.currencyMore' | translate">
                  <svg class="header__dropdown-toggle-icon" [class.is-open]="isCurrencyExpanded()" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>

                @if (isCurrencyExpanded()) {
                  @for (currency of otherCurrencies(); track currency.key) {
                    <button
                      type="button"
                      class="header__dropdown-item"
                      [class.active]="(currentCurrencyKey() === currency.key)"
                      (click)="selectCurrency(currency.key)"
                      role="menuitem">
                      <span class="currency-symbol">{{ currency.symbol }}</span>
                      <span>{{ currency.countryName }} ({{ currency.currencyCode }})</span>
                    </button>
                  }
                }
              </div>
            }
          </div>

          <!-- Language Selector -->
          <div class="header__localization" #languageContainer>
            <button
              type="button"
              class="header__icon-btn"
              (click)="toggleLanguageMenu()"
              [attr.aria-expanded]="isLanguageMenuOpen()"
              [attr.aria-label]="'header.language' | translate">
              <span class="fi fi-{{ getFlagCode(getCurrentLanguageCountryCode()) }}"></span>
            </button>

            @if (isLanguageMenuOpen()) {
              <div class="header__dropdown" role="menu">
                @for (lang of mustLanguages(); track lang.key) {
                  <button
                    type="button"
                    class="header__dropdown-item"
                    [class.active]="(currentLanguageCountryKey() === lang.key)"
                    (click)="selectLanguage(lang.key)"
                    role="menuitem">
                    <span class="fi fi-{{ getFlagCode(lang.countryCode) }}"></span>
                    <span>{{ lang.countryName }} ({{ lang.languageCode.toUpperCase() }})</span>
                  </button>
                }
                <button
                  type="button"
                  class="header__dropdown-toggle"
                  (click)="toggleLanguageExpanded()"
                  [attr.aria-expanded]="isLanguageExpanded()"
                  [attr.aria-label]="'header.languageMore' | translate">
                  <svg class="header__dropdown-toggle-icon" [class.is-open]="isLanguageExpanded()" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                @if (isLanguageExpanded()) {
                  @for (lang of otherLanguages(); track lang.key) {
                    <button
                      type="button"
                      class="header__dropdown-item"
                      [class.active]="(currentLanguageCountryKey() === lang.key)"
                      (click)="selectLanguage(lang.key)"
                      role="menuitem">
                      <span class="fi fi-{{ getFlagCode(lang.countryCode) }}"></span>
                      <span>{{ lang.countryName }} ({{ lang.languageCode.toUpperCase() }})</span>
                    </button>
                  }
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

  store = inject(Store);
  translate = inject(TranslateService);
  authModalService = inject(AuthModalService);

  currentUser = toSignal(this.store.select(selectUser));

  onLogin() {
    this.authModalService.showAuthModal();
  }

  onLogout() {
    this.store.dispatch(logout());
  }

  @ViewChild('currencyContainer') currencyContainer?: ElementRef;
  @ViewChild('languageContainer') languageContainer?: ElementRef;

  onSearchChange = output<string>();
  onLanguageChange = output<Language>();
  onCurrencyChange = output<Currency>();

  isLanguageMenuOpen = signal(false);
  isCurrencyMenuOpen = signal(false);
  isCurrencyExpanded = signal(false);
  isLanguageExpanded = signal(false);
  isDarkMode = signal(true);
  isSearchFocused = signal(false);
  currentSearchValue = signal('');

  // Computed signal for search active state (has value and not focused)
  isSearchActive = computed(() => {
    return !this.isSearchFocused() && this.currentSearchValue() !== '';
  });
  currentCurrencyKey = signal('');
  currentLanguageCountryKey = signal('');

  private countries = toSignal<CountriesMap | null>(this.store.select(selectCountries), { initialValue: null });
  private currenciesInfo = toSignal<any>(this.store.select(selectCurrenciesInfo), { initialValue: null });

  readonly mustCurrencies = computed<CurrencyOption[]>(() => {
    const map = this.countries();
    const currInfo = this.currenciesInfo();
    if (!map || !currInfo) return [];

    // Find any EUR country to get EUR rate
    const eurCountry = Object.values(map).find((country) => country.currency === 'EUR');
    const eurInfo = currInfo['EUR'];
    const eurEntry: CurrencyOption[] = eurCountry && eurInfo ? [{
      key: 'EUR',
      countryCode: 'EUR',
      countryName: 'Europe',
      currencyCode: 'EUR',
      symbol: eurInfo.symbol,
      rate: eurCountry.rate,
    }] : [];

    // Find USA entry
    const usaCountry = map['USA'];
    const usdInfo = currInfo[usaCountry?.currency];
    const usaEntry: CurrencyOption[] = usaCountry && usaCountry.must && usdInfo ? [{
      key: usaCountry.code,
      countryCode: usaCountry.code,
      countryName: usaCountry.original,
      currencyCode: usaCountry.currency,
      symbol: usdInfo.symbol,
      rate: usaCountry.rate,
    }] : [];

    const currencies = Object.values(map)
      .filter((country) => country.must && country.currency !== 'EUR' && country.code !== 'USA')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => {
        const info = currInfo[country.currency];
        return {
          key: country.code,
          countryCode: country.code,
          countryName: country.original,
          currencyCode: country.currency,
          symbol: info?.symbol || '$',
          rate: country.rate,
        };
      });

    return [...eurEntry, ...usaEntry, ...currencies];
  });

  readonly otherCurrencies = computed<CurrencyOption[]>(() => {
    const map = this.countries();
    const currInfo = this.currenciesInfo();
    if (!map || !currInfo) return [];
    return Object.values(map)
      .filter((country) => !country.must && country.currency !== 'EUR')
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => {
        const info = currInfo[country.currency];
        return {
          key: country.code,
          countryCode: country.code,
          countryName: country.original,
          currencyCode: country.currency,
          symbol: info?.symbol || '$',
          rate: country.rate,
        };
      });
  });

  readonly allCurrencies = computed<CurrencyOption[]>(() => [
    ...this.mustCurrencies(),
    ...this.otherCurrencies(),
  ]);

  readonly mustLanguages = computed<LanguageOption[]>(() => {
    const map = this.countries();
    if (!map) return [];
    return Object.values(map)
      .filter((country) => country.must)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => ({
        key: country.code,
        countryCode: country.code,
        countryName: country.original,
        languageCode: this.getLanguageForCountry(country.code),
      }));
  });

  readonly otherLanguages = computed<LanguageOption[]>(() => {
    const map = this.countries();
    if (!map) return [];
    return Object.values(map)
      .filter((country) => !country.must)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => ({
        key: country.code,
        countryCode: country.code,
        countryName: country.original,
        languageCode: this.getLanguageForCountry(country.code),
      }));
  });

  readonly allLanguages = computed<LanguageOption[]>(() => [
    ...this.mustLanguages(),
    ...this.otherLanguages(),
  ]);

  constructor() {
    this.initializeDarkMode();
    this.initializeCurrency();
    this.initializeLanguageSelection();

    // Apply dark mode class whenever isDarkMode signal changes
    effect(() => {
      this.applyDarkMode(this.isDarkMode());
    });
  }

  /**
   * Handle clicks outside dropdowns to close them
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside currency dropdown
    if (this.isCurrencyMenuOpen() && this.currencyContainer) {
      const currencyElement = this.currencyContainer.nativeElement;
      if (!currencyElement.contains(target)) {
        this.isCurrencyMenuOpen.set(false);
        this.isCurrencyExpanded.set(false);
      }
    }

    // Check if click is outside language dropdown
    if (this.isLanguageMenuOpen() && this.languageContainer) {
      const languageElement = this.languageContainer.nativeElement;
      if (!languageElement.contains(target)) {
        this.isLanguageMenuOpen.set(false);
        this.isLanguageExpanded.set(false);
      }
    }
  }

  /**
   * Initialize currency from localStorage
   */
  private initializeCurrency(): void {
    const stored = localStorage.getItem('denumismat-currency');
    if (stored) {
      this.currentCurrencyKey.set(stored);
      this.store.dispatch(setSelectedCurrency({ currencyKey: stored }));
    }
    effect(() => {
      const list = this.allCurrencies();
      if (!list.length) return;
      const current = this.currentCurrencyKey();
      const match = list.find((currency) => currency.key === current);
      if (!match) {
        this.currentCurrencyKey.set(list[0].key);
        this.store.dispatch(setSelectedCurrency({ currencyKey: list[0].key }));
      }
    });
  }

  /**
   * Initialize dark mode from localStorage or system preference
   */
  private initializeDarkMode(): void {
    const stored = localStorage.getItem('denumismat.dark-mode');

    if (stored) {
      this.isDarkMode.set(stored === 'true');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark || true);
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

    localStorage.setItem('denumismat.dark-mode', isDark.toString());
  }

  /**
   * Toggle dark theme on/off
   */
  toggleDarkTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  handleSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentSearchValue.set(value);
    this.onSearchChange.emit(value);
  }

  onSearchFocus(): void {
    this.isSearchFocused.set(true);
  }

  onSearchBlur(): void {
    this.isSearchFocused.set(false);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(open => !open);
  }

  toggleLanguageExpanded(): void {
    this.isLanguageExpanded.update((open) => !open);
  }

  toggleCurrencyExpanded(): void {
    this.isCurrencyExpanded.update((open) => !open);
  }

  async selectLanguage(countryCode: string): Promise<void> {
    const lang = this.getLanguageForCountry(countryCode);
    this.currentLanguageCountryKey.set(countryCode);
    this.store.dispatch(setSelectedLanguage({ countryKey: countryCode }));

    try {
      await this.translate.use(lang as any).toPromise();
      localStorage.setItem('denumismat-lang', lang);
      localStorage.setItem('denumismat-lang-country', countryCode);
      this.onLanguageChange.emit(lang);
    } catch (error) {
      // Translation file doesn't exist, fall back to USA/en
      console.warn(`Translation file for '${lang}' not found, falling back to English`);
      const fallbackCountry = 'USA';
      const fallbackLang = 'en';
      this.currentLanguageCountryKey.set(fallbackCountry);
      this.store.dispatch(setSelectedLanguage({ countryKey: fallbackCountry }));
      await this.translate.use(fallbackLang as any).toPromise();
      localStorage.setItem('denumismat-lang', fallbackLang);
      localStorage.setItem('denumismat-lang-country', fallbackCountry);
      this.onLanguageChange.emit(fallbackLang);
    }

    this.isLanguageMenuOpen.set(false);
  }

  getCurrentLanguageCountryCode(): string {
    const current = this.currentLanguageCountryKey();
    if (current) return current;
    const lang = this.translate.currentLang || this.translate.getDefaultLang();
    return this.getDefaultCountryForLanguage(lang as Language);
  }

  private initializeLanguageSelection(): void {
    const storedCountry = localStorage.getItem('denumismat-lang-country');
    if (storedCountry) {
      const storedLang = localStorage.getItem('denumismat-lang');
      const langToCheck = storedLang || this.getLanguageForCountry(storedCountry);

      // Verify translation file exists
      this.translate.use(langToCheck as any).subscribe({
        next: () => {
          this.currentLanguageCountryKey.set(storedCountry);
          this.store.dispatch(setSelectedLanguage({ countryKey: storedCountry }));
        },
        error: () => {
          // Translation doesn't exist, fall back to USA/en
          console.warn(`Translation file for '${langToCheck}' not found, falling back to English`);
          const fallbackCountry = 'USA';
          const fallbackLang = 'en';
          this.currentLanguageCountryKey.set(fallbackCountry);
          this.store.dispatch(setSelectedLanguage({ countryKey: fallbackCountry }));
          this.translate.use(fallbackLang);
          localStorage.setItem('denumismat-lang', fallbackLang);
          localStorage.setItem('denumismat-lang-country', fallbackCountry);
        }
      });
    } else {
      const lang = this.translate.currentLang || this.translate.getDefaultLang();
      const countryKey = this.getDefaultCountryForLanguage(lang as Language);
      this.currentLanguageCountryKey.set(countryKey);
      this.store.dispatch(setSelectedLanguage({ countryKey }));
    }
    effect(() => {
      const list = this.allLanguages();
      if (!list.length) return;
      const current = this.currentLanguageCountryKey();
      const match = list.find((option) => option.key === current);
      if (!match) {
        this.currentLanguageCountryKey.set(list[0].key);
        this.store.dispatch(setSelectedLanguage({ countryKey: list[0].key }));
      }
    });
  }

  private getLanguageForCountry(countryCode: string): Language {
    return ALPHA3_TO_ALPHA2[countryCode] || 'en';
  }

  private getDefaultCountryForLanguage(language: Language): string {
    return language === 'ua' ? 'UKR' : 'USA';
  }

  toggleCurrencyMenu(): void {
    this.isCurrencyMenuOpen.update(open => !open);
  }

  selectCurrency(currency: Currency): void {
    this.currentCurrencyKey.set(currency);
    localStorage.setItem('denumismat-currency', currency);
    this.store.dispatch(setSelectedCurrency({ currencyKey: currency }));
    const selected = this.allCurrencies().find((option) => option.key === currency);
    this.onCurrencyChange.emit(selected ? selected.currencyCode : currency);
    this.isCurrencyMenuOpen.set(false);
  }

  getCurrentCurrency(): CurrencyOption {
    const list = this.allCurrencies();
    const current = list.find((currency) => currency.key === this.currentCurrencyKey());
    const currInfo = this.currenciesInfo();
    const usdInfo = currInfo?.['USD'];
    return current || list[0] || {
      key: 'USA',
      countryCode: 'USA',
      countryName: 'United States of America',
      currencyCode: 'USD',
      symbol: usdInfo?.symbol || '$',
      rate: 0,
    };
  }

  getFlagCode(countryCode: string): string {
    return ALPHA3_TO_ALPHA2[countryCode] || countryCode.toLowerCase().slice(0, 2);
  }
}
