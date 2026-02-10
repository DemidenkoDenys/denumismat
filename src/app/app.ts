import { Component, ChangeDetectionStrategy, signal, ViewChild, OnInit, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent, type Language, type Currency } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';
import { SelectionBarComponent } from './components/selection-bar/selection-bar';
import { FooterComponent } from './components/footer/footer';
import { MessageTooltipComponent } from './components/message-tooltip/message-tooltip';
import { OrderModalComponent } from './components/order-modal/order-modal';
import { AuthModalComponent } from './components/auth-modal/auth-modal';
import { ImageSliderModalComponent } from './components/coins/image-slider-modal';
import * as CurrencyActions from './state/currency.actions';
import * as CountriesActions from './state/countries.actions';
import * as CoinsActions from './state/coins.actions';
import * as AuthActions from './state/auth/auth.actions';
import { selectCurrencyRates, selectSelectedCurrency, selectCurrenciesInfo } from './state/currency.selectors';
import { selectCountries } from './state/countries.selectors';
import { selectIsLoggedIn } from './state/auth/auth.selectors';
import { PingService } from './services/ping.service';

@Component({
  selector: 'app-root',
  template: `
    <app-header
      [searchQuery]="searchQuery()"
      [currentLanguage]="currentLanguage()"
      (onSearchChange)="handleSearch($event)"
      (onLanguageChange)="handleLanguageChange($event)"
      (onCurrencyChange)="handleCurrencyChange($event)">
    </app-header>

    <main>
      <app-introduction></app-introduction>
      <app-filters
        [selectedCount]="selectedCount()"
        [priceBounds]="priceBounds()"
        [priceRange]="priceRange()"
        [currencyFormat]="currencyFormat()"
        [conversionRate]="conversionRate()"
        [allCoins]="coinGrid?.coins() || []"
        (filterChange)="handleFilters($event)">
      </app-filters>
      <app-coin-grid
        #coinGrid
        [filters]="filters()"
        [searchQuery]="searchQuery()"
        [conversionRate]="conversionRate()"
        [currencyFormat]="currencyFormat()"
        (selectedSummary)="handleSelectionSummary($event)"
        (priceBoundsChange)="handlePriceBoundsChange($event)"
        (openSliderModal)="openImageSliderModal($event)">
      </app-coin-grid>
      <app-selection-bar
        [count]="selectedCount()"
        [totalWeight]="selectedWeight()"
        [totalPrice]="selectedPrice()"
        [totalDiscountPrice]="selectedDiscountPrice()"
        [conversionRate]="conversionRate()"
        [currencyFormat]="currencyFormat()"
        (onReset)="handleReset()"
        (onBook)="handleBookClick()"
        (onOrder)="handleOrderClick()"></app-selection-bar>
    </main>
    <app-footer></app-footer>
    <app-message-tooltip (onAuthRequired)="handleAuthRequired()" [authSuccessTrigger]="authSuccessTrigger()"></app-message-tooltip>

    @if (isOrderModalOpen()) {
      <app-order-modal
        [coins]="selectedCoins()"
        [conversionRate]="conversionRate()"
        [currencyFormat]="currencyFormat()"
        (onClose)="closeOrderModal()"
        (onSubmit)="handleOrderSubmit($event)">
      </app-order-modal>
    }

    @if (isAuthModalOpen()) {
      <app-auth-modal
        (onClose)="closeAuthModal()"
        (onSubmit)="handleAuthSubmit($event)"
        (onAuthSuccess)="handleAuthSuccess()">
      </app-auth-modal>
    }

    @if (showImageSliderModal()) {
      <app-image-slider-modal
        [coinId]="sliderCoinId()"
        [altText]="sliderAltText()"
        (close)="closeImageSliderModal()">
      </app-image-slider-modal>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    IntroductionComponent,
    FiltersComponent,
    CoinGridComponent,
    SelectionBarComponent,
    FooterComponent,
    MessageTooltipComponent,
    OrderModalComponent,
    AuthModalComponent,
    ImageSliderModalComponent
  ]
})
export class App implements OnInit {
  private pingService = inject(PingService);
  private store = inject(Store);
  @ViewChild('coinGrid') coinGrid: any;
  searchQuery = signal('');
  currentLanguage = signal<Language>('en');
  currentCurrency = signal<Currency>('USD');
  selectedCount = signal(0);
  selectedWeight = signal(0);
  selectedPrice = signal(0);
  selectedDiscountPrice = signal(0);
  filters = signal<any>(null);
  priceBounds = signal<[number, number]>([0, 10000]);
  priceRange = signal<[number, number]>([0, 10000]);
  isOrderModalOpen = signal(false);
  isAuthModalOpen = signal(false);
  authSuccessTrigger = signal(0);
  showImageSliderModal = signal(false);
  sliderImages = signal<string[]>([]);
  sliderAltText = signal('Coin image');
  sliderCoinId = signal<string>('');

  private currencyRates = toSignal(this.store.select(selectCurrencyRates), { initialValue: null });
  private selectedCurrencyKey = toSignal(this.store.select(selectSelectedCurrency), { initialValue: null });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  private currenciesInfo = toSignal(this.store.select(selectCurrenciesInfo), { initialValue: null });
  private isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });

  selectedCoins = computed(() => {
    // We need to get the actual coin objects, usually this would come from the store or coinGrid
    if (this.coinGrid) {
      const allCoins = this.coinGrid.coins() || [];
      const selectedIds = this.coinGrid.selectedIds();
      const countries = this.countries() || {};

      return allCoins
        .filter((c: any) => selectedIds.includes(c.id))
        .map((c: any) => ({
          ...c,
          country_name: countries[c.country]?.name || c.country
        }));
    }
    return [];
  });

  conversionRate = computed(() => {
    const rates = this.currencyRates();
    const countryCode = this.selectedCurrencyKey();
    const countriesMap = this.countries();

    if (!rates || !countryCode || !countriesMap) return 1;

    // Get currency code from country
    const country = countriesMap[countryCode];
    const currencyCode = country?.currency || 'USD';

    return rates[currencyCode] || 1;
  });

  currentCurrencySymbol = computed(() => {
    const countryCode = this.selectedCurrencyKey();
    const countriesMap = this.countries();
    const currInfo = this.currenciesInfo();

    if (!countryCode || !countriesMap || !currInfo) return '$';

    // Get currency code from country
    let currencyCode: string;
    if (countryCode === 'EUR') {
      currencyCode = 'EUR';
    } else {
      const country = countriesMap[countryCode];
      currencyCode = country?.currency || 'USD';
    }

    // Get symbol from currency info
    const info = currInfo[currencyCode];
    return info?.symbol || '$';
  });

  currencyFormat = computed(() => {
    const countryCode = this.selectedCurrencyKey();
    const countriesMap = this.countries();
    const currInfo = this.currenciesInfo();

    if (!countryCode || !countriesMap || !currInfo) {
      return { symbol: '$', short: '$', start: true };
    }

    // Get currency code from country
    let currencyCode: string;
    if (countryCode === 'EUR') {
      currencyCode = 'EUR';
    } else {
      const country = countriesMap[countryCode];
      currencyCode = country?.currency || 'USD';
    }

    // Get format info from currency info
    const info = currInfo[currencyCode];
    return {
      symbol: info?.symbol || '$',
      short: info?.short || '$',
      start: info?.start !== false
    };
  });

  ngOnInit(): void {
    this.store.dispatch(CurrencyActions.loadCurrencyRates());
    this.store.dispatch(CurrencyActions.loadCurrenciesInfo());
    this.store.dispatch(CountriesActions.loadCountries());
    this.store.dispatch(CountriesActions.loadExtinctCountries());
    this.store.dispatch(CoinsActions.loadCoins());
    this.store.dispatch(AuthActions.checkAuth());

    // Check if user data exists in localStorage and set in store if no auth user profile
    this.initializeUserFromLocalStorage();
  }

  private initializeUserFromLocalStorage(): void {
    // Use setTimeout to ensure checkAuth has completed
    setTimeout(() => {
      if (!this.isLoggedIn()) {
        const storedName = localStorage.getItem('denumismat.name');
        const storedEmail = localStorage.getItem('denumismat.email');

        if (storedName && storedEmail) {
          const user = {
            uid: `local-${Date.now()}`,
            displayName: storedName,
            email: storedEmail,
            photoURL: null
          };
          this.store.dispatch(AuthActions.setAuthUser({ user }));
        }
      }
    }, 100);
  }

  handleSearch(query: string): void {
    this.searchQuery.set(query);
    // TODO: Dispatch search action to store
  }

  handleLanguageChange(lang: Language): void {
    this.currentLanguage.set(lang);
    // TODO: Update i18n and persist language preference
  }

  handleCurrencyChange(currency: Currency): void {
    this.currentCurrency.set(currency);
    console.log('Currency changed to:', currency);
  }

  handleFilters(filters: any): void {
    this.filters.set(filters);
    if (filters?.priceRange) {
      this.priceRange.set(filters.priceRange);
    }
  }

  handleSelectionSummary(summary: { ids: string[]; totalWeight: number; totalPrice: number; totalDiscountPrice: number }) {
    this.selectedCount.set(summary.ids.length);
    this.selectedWeight.set(Math.round(summary.totalWeight));
    this.selectedPrice.set(Number(summary.totalPrice.toFixed(2)));
    this.selectedDiscountPrice.set(Number(summary.totalDiscountPrice.toFixed(2)));
  }

  handlePriceBoundsChange(bounds: [number, number]) {
    this.priceBounds.set(bounds);
    const [currentMin, currentMax] = this.priceRange();
    const [min, max] = bounds;
    if (currentMin < min || currentMax > max || (currentMin === 0 && currentMax === 10000)) {
      this.priceRange.set([min, max]);
    }
  }

  handleReset() {
    if (this.coinGrid) {
      this.coinGrid.resetTrigger.update((v: number) => v + 1);
    }
  }

  handleOrderClick() {
    this.isOrderModalOpen.set(true);
  }

  handleBookClick() {
    if (!this.isLoggedIn()) {
      this.isAuthModalOpen.set(true);
    } else {
      // User is logged in, proceed with booking
      this.handleBooking();
    }
  }

  handleBooking() {
    this.handleReset();
  }

  handleAuthRequired() {
    this.isAuthModalOpen.set(true);
  }

  handleAuthSuccess() {
    this.authSuccessTrigger.update(v => v + 1);
  }

  closeOrderModal() {
    this.isOrderModalOpen.set(false);
  }

  closeAuthModal() {
    this.isAuthModalOpen.set(false);
  }

  handleOrderSubmit(data: { name: string; email: string; coins: any[] }) {
    console.log('Order submitted:', data);
    this.isOrderModalOpen.set(false);
    this.handleReset();
    // Here you would typically dispatch an action or call a service to process the order
    alert(`Thank you ${data.name}! We received your order for ${data.coins.length} coins.`);
  }

  handleAuthSubmit(data: { name: string; email: string }) {
    this.isAuthModalOpen.set(false);

    // Use localStorage values for consistency
    const storedName = localStorage.getItem('denumismat.name') || data.name;
    const storedEmail = localStorage.getItem('denumismat.email') || data.email;

    // Set user data in store
    const user = {
      uid: `local-${Date.now()}`, // Generate a simple local uid
      displayName: storedName,
      email: storedEmail,
      photoURL: null
    };
    this.store.dispatch(AuthActions.setAuthUser({ user }));

    // Proceed with booking after authentication
    this.handleBooking();
  }

  openImageSliderModal(event: { coinId: string, alt: string }) {
    this.sliderCoinId.set(event.coinId);
    this.sliderAltText.set(event.alt);
    this.showImageSliderModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeImageSliderModal = () => {
    this.showImageSliderModal.set(false);
    document.body.style.overflow = '';
  }
}
