import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MainLayoutComponent } from '../../main-layout';
import { selectIsLoggedIn, selectIsAdmin } from '../../state/auth/auth.selectors';
import { loginWithGoogle, setAuthUser, setIsAdmin } from '../../state/auth/auth.actions';
import { TranslateModule } from '@ngx-translate/core';
import { UserSelectionBarComponent } from '../user-selection-bar/user-selection-bar';
import { ImageSliderModalComponent } from '../coins/image-slider-modal';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { AuthModalService } from '../../services/auth-modal.service';
import { OrderModalComponent } from '../order-modal/order-modal';
import { selectCurrenciesInfo, selectCurrencyRates, selectSelectedCurrency } from '../../state/currency.selectors';
import { selectCountries } from '../../state/countries.selectors';
import { selectSelectedCoins } from '../../state/coins.selectors';
import { clearSelection, deselectCoin } from '../../state/coins.actions';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'user-wrapper',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, UserSelectionBarComponent, ImageSliderModalComponent, AuthModalComponent, OrderModalComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-wrapper">
      <app-main-layout
      (onAuthRequired)="handleAuthRequired()"
      (openSliderModal)="openImageSliderModal($event)"
      ></app-main-layout>

      <user-selection-bar
        (onBook)="handleBookClick()"
        (onOrder)="handleOrderClick()"
        (onReset)="handleResetClick()"
      ></user-selection-bar>
    </div>

    @if (showImageSliderModal()) {
      <app-image-slider-modal
        [coinId]="sliderCoinId()"
        [altText]="sliderAltText()"
        (close)="closeImageSliderModal()">
      </app-image-slider-modal>
    }

    @if (authModalService.isAuthModalVisible()) {
      <app-auth-modal
        (onClose)="closeAuthModal()"
        (onSubmit)="handleAuthSubmit($event)"
        (onAuthSuccess)="handleAuthSuccess()">
      </app-auth-modal>
    }

    @if (isOrderModalOpen()) {
      {{ orderCoins() | json }}
      <app-order-modal
        [coins]="orderCoins()"
        [conversionRate]="conversionRate()"
        [currencyFormat]="currencyFormat()"
        (onClose)="closeOrderModal()"
        (onSubmit)="handleOrderSubmit($event)">
      </app-order-modal>
    }
  `,
})
export class UserWrapperComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private service = inject(UserService);
  public authModalService = inject(AuthModalService);

  showImageSliderModal = signal(false);
  sliderAltText = signal('Coin image');
  sliderCoinId = signal<string>('');
  isOrderModalOpen = signal(false);
  isAuthModalOpen = signal(false);
  authSuccessTrigger = signal(0);
  isAuthFormValid = signal(false);

  private isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  private isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  private selectedCoins = toSignal(this.store.select(selectSelectedCoins), { initialValue: null });
  private currencyRates = toSignal(this.store.select(selectCurrencyRates), { initialValue: null });
  private currenciesInfo = toSignal(this.store.select(selectCurrenciesInfo), { initialValue: null });
  private selectedCurrencyKey = toSignal(this.store.select(selectSelectedCurrency), { initialValue: null });

  orderCoins = computed(() => {
    return Object.values(this.selectedCoins() ?? {});
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

  ngOnInit() {
    this.clearAuthData();
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

  handleAuthRequired() {
    this.authModalService.showAuthModal();
  }

  handleAuthSuccess() {
    this.authSuccessTrigger.update(v => v + 1);
  }

  closeOrderModal() {
    this.isOrderModalOpen.set(false);
  }

  closeAuthModal() {
    this.isAuthModalOpen.set(false);
    this.authModalService.hideAuthModal();
  }

  handleOrderClick() {
    this.isOrderModalOpen.set(true);
  }

  handleResetClick() {
    this.store.dispatch(clearSelection());
  }

  handleBookClick() {
    if (!this.isLoggedIn()) {
      this.authModalService.showAuthModal();
    } else {
    this.handleBooking();
    }
  }

  handleBooking() {
    const coins = this.selectedCoins() ?? {};

    for (const id in coins) {
      if (!coins[id].booked_at) {
        this.service.bookCoin(coins[id].id, 'user@example.com').subscribe(() => {
          this.store.dispatch(deselectCoin({ coinId: coins[id].id }))
        });
      } else {
        console.log('Coin already booked:', coins[id].id);
      }
    }
  }

  handleOrderSubmit(data: { name: string; email: string; coins: any[] }) {
    this.isOrderModalOpen.set(false);
  }

  private clearAuthData() {
    // Clear localStorage items
    localStorage.removeItem('denumismat.name');
    localStorage.removeItem('denumismat.email');
    localStorage.removeItem('auth_user_profile');

    // Reset auth state in store
    this.store.dispatch(setAuthUser({ user: null }));
    this.store.dispatch(setIsAdmin({ isAdmin: false }));
  }

  signInWithGoogle() {
    this.store.dispatch(loginWithGoogle());
  }

  navigateToUserRoute() {
    this.router.navigate(['/']);
  }

  handleAuthSubmit(data: { name: string; email: string }) {
    const user = {
      uid: `admin-${Date.now()}`,
      displayName: data.name,
      email: data.email,
      photoURL: null
    };

    this.store.dispatch(setAuthUser({ user }));
    this.store.dispatch(setIsAdmin({ isAdmin: true }));
  }
}
