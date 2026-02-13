import { Component, Input, Output, EventEmitter, signal, inject, computed, effect, output, HostListener, ViewChild, ElementRef, input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Language, LanguageOption } from '../header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { CountriesMap, CountryInfo } from '../../state/countries.models';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ALPHA3_TO_ALPHA2 } from '../../config/country-codes';
import { selectCoinsCountries } from '../../state/coins.selectors';

@Component({
  selector: 'country-dropdown',
  standalone: true,
  templateUrl: './country-dropdown.component.html',
  imports: [TranslateModule]
})
export class CountryDropdownComponent {
  store = inject(Store);
  private _value: string | null = null;
  @Input()
  set value(country: string) {
    this.selectedCountry.set(country);
  }
  get value(): string | null {
    return this._value;
  }
  translate = inject(TranslateService);
  isMenuOpen = signal(false);
  selectedCountry = signal('');
  onCountryChanged = output<string>();

  countries = toSignal<CountriesMap | null>(this.store.select(selectCountries), { initialValue: null });
  coinCountries = toSignal<any>(this.store.select(selectCoinsCountries), { initialValue: null });
  extinctCountries = toSignal<CountriesMap | null>(this.store.select(selectExtinctCountries), { initialValue: null });

  @ViewChild('languageContainer') languageContainer?: ElementRef;

  readonly countryList = computed<CountryInfo[]>(() => {
    const countries = this.countries();
    const coinCountries = this.coinCountries();
    const extinctCountries = this.extinctCountries();

    if (!countries || !extinctCountries || !coinCountries) return [];
    return [...Object.values(countries), ...Object.values(extinctCountries)].filter((country) => !!coinCountries[country.code]);
  })

  async selectCountry(countryCode: string): Promise<void> {
    this.selectedCountry.set(countryCode);
    this.onCountryChanged.emit(countryCode);
    this.isMenuOpen.set(false);
  }

  toggleLanguageMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  toggleLanguageExpanded(): void {
    this.isMenuOpen.update((open) => !open);
  }

  getFlagCode(countryCode: string): string {
    return ALPHA3_TO_ALPHA2[countryCode];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Check if click is outside language dropdown
    if (this.isMenuOpen() && this.languageContainer) {
      const languageElement = this.languageContainer.nativeElement;
      if (!languageElement.contains(target)) {
        this.isMenuOpen.set(false);
        this.isMenuOpen.set(false);
      }
    }
  }
}
