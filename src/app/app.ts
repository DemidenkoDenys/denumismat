import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { MainLayoutComponent } from './main-layout';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet
      (activate)="onRouteActivate($event)">
    </router-outlet>

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
    CommonModule,
    RouterOutlet,
    OrderModalComponent,
    AuthModalComponent,
    ImageSliderModalComponent
  ]
})
export class App implements OnInit {
  private pingService = inject(PingService);
  private store = inject(Store);
  private activeLayoutComponent: MainLayoutComponent | null = null;

  isOrderModalOpen = signal(false);
  isAuthModalOpen = signal(false);
  authSuccessTrigger = signal(0);
  showImageSliderModal = signal(false);
  sliderAltText = signal('Coin image');
  sliderCoinId = signal<string>('');
  isAuthFormValid = signal(false);

  private currencyRates = toSignal(this.store.select(selectCurrencyRates), { initialValue: null });
  private selectedCurrencyKey = toSignal(this.store.select(selectSelectedCurrency), { initialValue: null });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  private currenciesInfo = toSignal(this.store.select(selectCurrenciesInfo), { initialValue: null });
  private isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });

  static ADTL = 'ZGVudW1pc21hdC1hZG1pbi10b29s';

  ngOnInit() {}

  selectedCoins = computed(() => {
    if (this.activeLayoutComponent?.coinGrid) {
      const allCoins = this.activeLayoutComponent.coinGrid.coins() || [];
      const selectedIds = this.activeLayoutComponent.coinGrid.selectedIds();
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

  onRouteActivate(component: MainLayoutComponent) {
    this.activeLayoutComponent = component;
    // Connect the component's outputs to our handlers
    if (component) {
      component.onOrderClick.subscribe(() => this.handleOrderClick());
      component.onBookClick.subscribe(() => this.handleBookClick());
      component.onAuthRequired.subscribe(() => this.handleAuthRequired());
      component.openSliderModal.subscribe((event: any) => this.openImageSliderModal(event));
    }
  }

  handleOrderClick() {
    this.isOrderModalOpen.set(true);
  }

  handleBookClick() {
    if (!this.isLoggedIn()) {
      this.isAuthModalOpen.set(true);
    } else {
      this.handleBooking();
    }
  }

  handleBooking() {
    console.log('Booking coins for logged in user');
    if (this.activeLayoutComponent) {
      this.activeLayoutComponent.handleReset();
    }
    alert('Your coins have been booked successfully!');
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
    if (this.activeLayoutComponent) {
      this.activeLayoutComponent.handleReset();
    }
    alert(`Thank you ${data.name}! We received your order for ${data.coins.length} coins.`);
  }

  handleAuthSubmit(data: { name: string; email: string }) {
    this.isAuthModalOpen.set(false);

    const storedName = localStorage.getItem('denumismat.name') || data.name;
    const storedEmail = localStorage.getItem('denumismat.email') || data.email;

    const user = {
      uid: `local-${Date.now()}`,
      displayName: storedName,
      email: storedEmail,
      photoURL: null
    };
    this.store.dispatch(AuthActions.setAuthUser({ user }));

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
