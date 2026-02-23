import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, ViewChild, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, effect, Renderer2, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';
import { Coin } from '../coins/coin-card';
import { PricePipe } from '../../pipes/price.pipe';
import { AuthForm } from '../auth-form/auth-form';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';
import { selectShippingMethods } from '../../state/shipping.selectors';
import { ShippingMethod } from '../../state/shipping.reducer';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (mousedown)="onBackdropMouseDown($event)" (mouseup)="onBackdropMouseUp($event)">
      <div class="modal-container" (mousedown)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ 'orderModal.title' | translate }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="selected-coins-list">
            <h3>{{ 'orderModal.confirmEachCoin' | translate }}</h3>
            <ul class="coin-list" [class.has-selection]="hasSelection()" [class.submitted]="submitted()">
              @for (coin of coins(); track coin.id) {
                <li class="coin-item" (click)="toggleCoin(coin.id)" [class.excluded]="!isSelected(coin.id)">
                  <div class="coin-check">
                    <input type="checkbox" [checked]="isSelected(coin.id)" (click)="toggleCoin(coin.id, $event)">
                  </div>
                  <span class="coin-name">{{ countries()[coin.country]?.name }} - {{ coin.deno }} - {{ coin.year }}</span>
                  <span class="coin-price">{{ coin.discountPrice | price }}</span>
                </li>
              }
            </ul>
            <div class="total-price">
              <strong>{{ 'orderModal.total' | translate }}:</strong>
              <span>{{ totalAmount() | price }}</span>
            </div>
          </div>

          <form (ngSubmit)="submitOrder(orderForm)" #orderForm="ngForm" class="order-form">
            <div class="form-group">
              <label for="shippingMethod">{{ 'orderModal.shippingMethod' | translate }}&nbsp;&nbsp;<small class="shipping-label-details">{{ 'orderModal.shippingMethodDetails' | translate }}</small></label>
              <select id="shippingMethod" name="shippingMethod" [(ngModel)]="shippingMethod" required #shippingModel="ngModel" [class.submitted]="submitted()">
                <option value="" disabled hidden>{{ 'orderModal.shippingPlaceholder' | translate }}</option>
                @for (method of shippingMethods(); track method?.id) {
                  <option [value]="method?.id">{{ displayMethodLabel(method) | translate}}{{ method?.price ? ' - ' : '' }}{{ method?.price ? (method?.price | price) : '' }}</option>
                }
              </select>

              @if (shippingModel.invalid && (shippingModel.touched || submitted())) {
                <div class="field-error">{{ 'orderModal.shippingRequired' | translate }}</div>
              }
            </div>

            <div class="form-group">
              <label for="orderMessage">{{ 'orderModal.messageLabel' | translate }}</label>
              <textarea
                id="orderMessage"
                name="orderMessage"
                class="order-modal__textarea"
                [(ngModel)]="orderMessage"
                #messageModel="ngModel"
                required
                [class.submitted]="submitted()"
                maxlength="500"
                placeholder="{{ 'orderModal.messagePlaceholder' | translate }}"
              ></textarea>

              @if (messageModel.invalid && (messageModel.touched || submitted())) {
                <div class="field-error">{{ 'orderModal.messageRequired' | translate }}</div>
              }
            </div>

            <div class="form-row visibility-accept">
              <label class="checkbox">
                <input
                  type="checkbox"
                  ngModel
                  name="visibilityAccepted"
                  required
                  #visibilityAcceptedModel="ngModel"
                  aria-required="true"
                />
                <span>{{ 'orderModal.confirmCheckbox' | translate }}</span>
              </label>

              @if (visibilityAcceptedModel.invalid && (visibilityAcceptedModel.touched || submitted())) {
                <div class="field-error">
                  {{ 'orderModal.confirmCheckboxRequired' | translate }}
                </div>
              }
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn--ghost" (click)="close()">
                {{ 'orderModal.cancel' | translate }}
              </button>

              <button type="submit" class="btn btn--primary">
                {{ isSubmitting() ? ('orderModal.processing' | translate) : ('orderModal.submit' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class OrderModalComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private translate = inject(TranslateService);

  currentUser = toSignal(this.store.select(selectUser));
  excludedIds = signal<Set<string>>(new Set());

  existsCountries = toSignal(this.store.select(selectCountries));
  extinctCountries = toSignal(this.store.select(selectExtinctCountries));
  shippingMethods = toSignal(this.store.select(selectShippingMethods));

  countries = computed(() => ({ ...this.existsCountries(), ...this.extinctCountries() }));

  displayMethodLabel(method: ShippingMethod | undefined): string {
    if (!method) {
      return '';
    }
    const key = `orderModal.shipping.${method.id}`;
    const translated = this.translate.instant(key);
    return translated === key ? (method.label || method.id) : translated;
  }

  constructor() {
    effect(() => {
      const c = this.coins();
      this.excludedIds.set(new Set(c.map(coin => coin.id)));
    }, { allowSignalWrites: true });
  }

  toggleCoin(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.submitted.set(false);
    this.excludedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  isSelected(id: string): boolean {
    return !this.excludedIds().has(id);
  }

  hasSelection = computed(() => {
    const excluded = this.excludedIds();
    return this.coins().some(c => !excluded.has(c.id));
  });

  coins = input<Coin[]>([]);
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  onClose = output<void>();
  onSubmit = output<{ coins: Coin[]; shippingMethod?: string; message?: string }>();

  // shippingMethod left empty by default so user explicitly chooses it (optional)
  shippingMethod = '';
  orderMessage = '';
  isSubmitting = signal(false);
  submitted = signal(false);
  isFormValid = signal(false);
  private isBackdropMouseDown = false;

  onBackdropMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.isBackdropMouseDown = true;
    }
  }

  onBackdropMouseUp(event: MouseEvent) {
    if (this.isBackdropMouseDown && event.target === event.currentTarget) {
      this.close();
    }
    this.isBackdropMouseDown = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    }
  }

  totalAmount = computed(() => {
    return this.coins()
      .filter(c => !this.excludedIds().has(c.id))
      .reduce((sum, coin) => sum + (coin.discountPrice ?? 0), 0);
  });

  close() {
    this.onClose.emit();
  }

  submitOrder(form: NgForm) {
    this.submitted.set(true);
    this.isFormValid.set(!!form?.valid);

    // If the template-driven form is invalid, show validation UI and stop
    if (!form || !form.valid) {
      return;
    }

    // shippingMethod and orderMessage are required (redundant but safe)
    if (!this.shippingMethod || !this.orderMessage || this.orderMessage.trim().length === 0) {
      return;
    }

    // Require all coins to be selected/confirmed
    if (this.excludedIds().size > 0) {
      return;
    }

    const finalCoins = this.coins(); // All items must be selected at this point

    this.isSubmitting.set(true);

    // Simulate API call or just event emit
    setTimeout(() => {
      this.onSubmit.emit({
        coins: finalCoins,
        message: this.orderMessage?.trim() || undefined,
        shippingMethod: this.shippingMethod,
      });
      this.isSubmitting.set(false);
    }, 500);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeStyle(this.document.body, 'overflow');
    }
  }
}
