import { Component, Input, Output, EventEmitter, signal, inject, computed, effect, output, HostListener, ViewChild, ElementRef, input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Language, LanguageOption } from '../header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { CountriesMap } from '../../state/countries.models';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';
import { setSelectedLanguage } from '../../state/countries.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ALPHA3_TO_ALPHA2 } from '../../config/country-codes';

@Component({
  selector: 'country-dropdown',
  standalone: true,
  templateUrl: './country-dropdown.component.html',
  imports: [TranslateModule]
})
export class CountryDropdownComponent {
  store = inject(Store);
  isLeft = input(true);
  translate = inject(TranslateService);
  defaultTo = input();
  includeExtincts = input(false);
  onCountryChanged = output<string>();
  onLanguageChange = output<Language>();
  isLanguageExpanded = signal(false);
  isLanguageMenuOpen = signal(false);
  currentLanguageCountryKey = signal('');

  countries = toSignal<CountriesMap | null>(this.store.select(selectCountries), { initialValue: null });
  extinctCountries = toSignal<CountriesMap | null>(this.store.select(selectExtinctCountries), { initialValue: null });

  @ViewChild('languageContainer') languageContainer?: ElementRef;

  readonly allLanguages = computed<LanguageOption[]>(() => [
    ...this.mustLanguages(),
    ...this.otherLanguages(),
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
        countryName: country.name,
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
        countryName: country.name,
        languageCode: this.getLanguageForCountry(country.code),
      }));
  });

  readonly extinctsLanguages = computed<LanguageOption[]>(() => {
    const map = this.extinctCountries();
    if (!map) return [];
    console.log(Object.keys(map).map(key => key.toLowerCase()));

    return Object.values(map)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((country) => ({
        key: country.code,
        countryCode: country.code,
        countryName: country.name,
        languageCode: this.getLanguageForCountry(country.code),
      }));
  });

  constructor() {
    this.initializeLanguageSelection();
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
    return ALPHA3_TO_ALPHA2[countryCode];
  }

  private getDefaultCountryForLanguage(language: Language): string {
    return language === 'ua' ? 'UKR' : 'USA';
  }

  async selectLanguage(countryCode: string): Promise<void> {
    this.isLanguageMenuOpen.set(false);
    this.currentLanguageCountryKey.set(countryCode);
    this.onCountryChanged.emit(countryCode);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(open => !open);
  }

  toggleLanguageExpanded(): void {
    this.isLanguageExpanded.update((open) => !open);
  }

  getCurrentLanguageCountryCode(): string {
    const current = this.currentLanguageCountryKey();
    if (current) return current;
    const lang = this.translate.currentLang || this.translate.getDefaultLang();
    return this.getDefaultCountryForLanguage(lang as Language);
  }

  getFlagCode(countryCode: string): string {
    return ALPHA3_TO_ALPHA2[countryCode] || countryCode.toLowerCase().slice(0, 2);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside language dropdown
    if (this.isLanguageMenuOpen() && this.languageContainer) {
      const languageElement = this.languageContainer.nativeElement;
      if (!languageElement.contains(target)) {
        this.isLanguageMenuOpen.set(false);
        this.isLanguageExpanded.set(false);
      }
    }
  }
}
