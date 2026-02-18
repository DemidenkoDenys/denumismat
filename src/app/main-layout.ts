import { Component, ChangeDetectionStrategy, signal, ViewChild, OnInit, inject, computed, output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent, type Language, type Currency } from './components/header/header';
import { IntroductionComponent } from './components/introduction/introduction';
import { FiltersComponent } from './components/filters/filters';
import { CoinGridComponent } from './components/coins/coin-grid';
import { FooterComponent } from './components/footer/footer';
import { MessageTooltipComponent } from './components/message-tooltip/message-tooltip';
import { ToastComponent } from './components/toast/toast';
import * as CurrencyActions from './state/currency.actions';
import * as CountriesActions from './state/countries.actions';
import * as CoinsActions from './state/coins.actions';
import * as AuthActions from './state/auth/auth.actions';
import { selectCurrencyRates, selectSelectedCurrency, selectCurrenciesInfo } from './state/currency.selectors';
import { selectCountries } from './state/countries.selectors';
import { selectIsLoggedIn } from './state/auth/auth.selectors';
import { PingService } from './services/ping.service';
import { ToastService } from './services/toast.service';
import { ADTL } from './app.constants';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';
import { loadShippingMethods } from './state/shipping.actions';

@Component({
  selector: 'app-main-layout',
  template: `
    <app-header
      [searchQuery]="searchQuery()"
      (onSearchChange)="handleSearch($event)"
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
        (openSliderModal)="openSliderModal.emit($event)">
      </app-coin-grid>
    </main>

    <app-footer></app-footer>

    <app-message-tooltip (onAuthRequired)="onAuthRequired.emit()" [authSuccessTrigger]="authSuccessTrigger()"></app-message-tooltip>
    <app-toast></app-toast>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    HeaderComponent,
    IntroductionComponent,
    FiltersComponent,
    CoinGridComponent,
    FooterComponent,
    MessageTooltipComponent,
    ToastComponent
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private pingService = inject(PingService);
  private store = inject(Store);
  private router = inject(Router);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);

  // Outputs for modal management
  onOrderClick = output<void>();
  onBookClick = output<void>();
  onAuthRequired = output<void>();
  openSliderModal = output<{ coinId: string, alt: string }>();

  @ViewChild('coinGrid') coinGrid: CoinGridComponent | undefined;

  searchQuery = signal('');
  currentCurrency = signal<Currency>('USD');
  selectedCount = signal(0);
  selectedPrice = signal(0);
  filters = signal<any>(null);
  priceBounds = signal<[number, number]>([0, 10000]);
  priceRange = signal<[number, number]>([0, 10000]);
  authSuccessTrigger = signal(0);

  private currencyRates = toSignal(this.store.select(selectCurrencyRates), { initialValue: null });
  private selectedCurrencyKey = toSignal(this.store.select(selectSelectedCurrency), { initialValue: null });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  private currenciesInfo = toSignal(this.store.select(selectCurrenciesInfo), { initialValue: null });
  private isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });

  conversionRate = computed(() => {
    const rates = this.currencyRates();
    const countryCode = this.selectedCurrencyKey();
    const countriesMap = this.countries();

    if (!rates || !countryCode || !countriesMap) return 1;

    const country = countriesMap[countryCode];
    const currencyCode = country?.currency || 'USD';

    return rates[currencyCode] || 1;
  });

  currencyFormat = computed(() => {
    const countryCode = this.selectedCurrencyKey();
    const countriesMap = this.countries();
    const currInfo = this.currenciesInfo();

    if (!countryCode || !countriesMap || !currInfo) {
      return { symbol: '$', short: '$', start: true };
    }

    let currencyCode: string;
    if (countryCode === 'EUR') {
      currencyCode = 'EUR';
    } else {
      const country = countriesMap[countryCode];
      currencyCode = country?.currency || 'USD';
    }

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
    this.store.dispatch(loadShippingMethods());
    this.store.dispatch(AuthActions.checkAuth());

    this.initializeUserFromLocalStorage();

    if (!localStorage.getItem('denumismat.welcome')) {
      this.toast.info('toast.welcome', 3000);
      localStorage.setItem('denumismat.welcome', Date.now().toString());
    }
  }

  private initializeUserFromLocalStorage(): void {
    setTimeout(() => {
      if (!this.isLoggedIn()) {
        const storedName = localStorage.getItem('denumismat.name');
        const storedEmail = localStorage.getItem('denumismat.email');

        if (storedName && storedEmail) {
          const user = {
            uid: `local-${Date.now()}`,
            displayName: storedName,
            email: storedEmail,
            photoURL: null,
            verified: false,
          };
          this.store.dispatch(AuthActions.setAuthUser({ user }));
        }
      }
    }, 100);
  }

  handleSearch(query: string): void {
    this.searchQuery.set(query);
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
    this.selectedPrice.set(Number(summary.totalPrice.toFixed(2)));
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

  handleAdminDataManagement() {
    alert('Admin: Data Management - Feature coming soon!');
    console.log('Admin data management accessed');
  }

  handleAdminSystemStatus() {
    alert('Admin: System Status - All systems operational!');
    console.log('Admin system status accessed');
  }

  handleAdminAnalytics() {
    alert('Admin: User Analytics - Feature coming soon!');
    console.log('Admin analytics accessed');
  }

  handleAdminSettings() {
    alert('Admin: Settings - Feature coming soon!');
  }

  ngOnDestroy(): void {
    this.authService.resetVerifyCode();
  }
}
