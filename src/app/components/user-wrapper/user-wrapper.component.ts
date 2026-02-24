import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MainLayoutComponent } from '../../main-layout';
import { selectIsLoggedIn, selectIsAdmin, selectUser } from '../../state/auth/auth.selectors';
import { loginWithGoogle, setAuthUser, setIsAdmin } from '../../state/auth/auth.actions';
import { TranslateModule } from '@ngx-translate/core';
import { UserSelectionBarComponent } from '../user-selection-bar/user-selection-bar';
import { ImageSliderModalComponent } from '../coins/image-slider-modal';
import { AuthModalComponent } from '../auth-modal/auth-modal';
import { AuthModalService } from '../../services/auth-modal.service';
import { OrderModalComponent } from '../order-modal/order-modal';
import { selectCurrenciesInfo, selectCurrencyRates, selectSelectedCurrency } from '../../state/currency.selectors';
import { selectCountries } from '../../state/countries.selectors';
import { selectCoinImages, selectSelectedCoins } from '../../state/coins.selectors';
import { clearSelection, deselectCoin } from '../../state/coins.actions';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { defaultIfEmpty, first, forkJoin, switchMap } from 'rxjs';
import { NotificationService } from '../../services/api.service';
import { Coin } from '../coins/coin-card';
import { forEach } from 'lodash';

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
        (onBook)="isLoggedIn() ? handleBooking() : openAuthModal()"
        (onOrder)="isLoggedIn() ? openOrderModal() : openAuthModal()"
        (onReset)="handleResetClick()"
      ></user-selection-bar>
    </div>

    @if (showImageSliderModal()) {
      <app-image-slider-modal
        [images]="images()"
        [index]="sliderIndex()"
        [video]="sliderVideo()"
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
  private toast = inject(ToastService);
  private router = inject(Router);
  private service = inject(UserService);
  private apiService = inject(NotificationService);
  private notificationService = inject(NotificationService);
  public authModalService = inject(AuthModalService);

  showImageSliderModal = signal(false);
  sliderAltText = signal('Coin image');
  sliderCoinId = signal<string>('');
  isOrderModalOpen = signal(false);
  isAuthModalOpen = signal(false);
  authSuccessTrigger = signal(0);
  isAuthFormValid = signal(false);
  sliderIndex = signal<number>(0);
  sliderVideo = signal<string | null>(null);

  public images = toSignal(this.store.select(selectCoinImages), { initialValue: null });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  public isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
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

  openImageSliderModal(event: any) {
    this.sliderCoinId.set(event.coinId);
    this.sliderVideo.set(event.video || null);
    this.sliderIndex.set(event.index || 0);
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

  openAuthModal() {
    this.authModalService.showAuthModal();
  }

  openOrderModal() {
    this.isOrderModalOpen.set(true);
  }

  handleResetClick() {
    this.store.dispatch(clearSelection());
  }

  handleBooking() {
    const coins = this.selectedCoins() ?? {};

    this.store.select(selectUser).pipe(first()).subscribe(user => {
      if (user?.email) {
        const bookingCoinIds = [];
        const bookingCoins$ = [];

        for (const id in coins) {
          if (!coins[id].booked_at) {
            bookingCoins$.push(this.service.bookCoin(coins[id].id, user.email.toLowerCase()));
            bookingCoinIds.push(id);
          } else {
            this.toast.show('toast.coinAlreadyBooked', { params: { coinId: coins[id].id } });
          }
        }

        forkJoin(bookingCoins$).pipe(
          defaultIfEmpty([]),
          switchMap(() => this.apiService.sendBookCoins(Object.values(coins), user.email ?? '')))
          .subscribe(() => {
            forEach(coins, (_, id) => this.store.dispatch(deselectCoin({ coinId: id })));
          });

        this.toast.show('toast.bookInfo');
      } else {
        this.toast.show('toast.authRequired');
      }
    });
  }

  handleOrderSubmit(data: { coins: any[]; shippingMethod?: string; message?: string }) {
    if (!data.coins || data.coins.length === 0) {
      return;
    }

    this.isOrderModalOpen.set(false);

    this.store.select(selectUser).pipe(first()).subscribe(user => {
      if (user?.email) {
        for (const coin of data.coins) {
          this.service.orderCoin(coin.id, user.email).subscribe({
            next: () => this.store.dispatch(deselectCoin({ coinId: coin.id })),
            error: () => this.toast.error(`Cannot order coin ${coin.id}`),
          });
        }

        this.notificationService.sendOrder(data.coins, user.email, data.shippingMethod || '', data.message || '').subscribe({
          next: () => this.toast.success('order success', 5000),
          error: () => this.toast.error('order error', 2000),
        });
      }
    });

  }

  private clearAuthData() {
    // Clear localStorage items
    localStorage.removeItem('denumismat.name');
    localStorage.removeItem('denumismat.email');
    localStorage.removeItem('auth_google_user');

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
      photoURL: null,
      verified: false
    };

    this.store.dispatch(setAuthUser({ user }));
    this.store.dispatch(setIsAdmin({ isAdmin: true }));
  }
}
