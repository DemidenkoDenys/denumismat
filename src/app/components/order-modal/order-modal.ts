import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, ViewChild, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Coin } from '../coins/coin-card';
import { PricePipe } from '../../pipes/price.pipe';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ 'orderModal.title' | translate }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="selected-coins-list">
            <h3>{{ 'orderModal.selectedCoins' | translate }}</h3>
            <ul class="coin-list">
              @for (coin of coins(); track coin.id) {
                <li class="coin-item">
                  <span class="coin-name">{{ coin.country_name }} - {{ coin.deno }} - {{ coin.year }}</span>
                  <span class="coin-price">{{ coin.price | price }}</span>
                </li>
              }
            </ul>
            <div class="total-price">
              <strong>{{ 'orderModal.total' | translate }}:</strong>
              <span>{{ totalAmount() | price }}</span>
            </div>
          </div>

          <form (ngSubmit)="submitOrder()" #orderForm="ngForm" class="order-form">
            <div class="form-group">
              <label for="name">{{ 'orderModal.name' | translate }}</label>
              <input
                type="text"
                id="name"
                name="name"
                [ngModel]="name"
                (ngModelChange)="onNameChange($event)"
                required
                placeholder="{{ 'orderModal.namePlaceholder' | translate }}"
                #nameInput="ngModel"
              >
              @if (nameInput.invalid && (nameInput.dirty || nameInput.touched) && nameInput.errors?.['required']) {
                <div class="error-message">
                  {{ 'orderModal.nameRequiredError' | translate }}
                </div>
              }
            </div>

            <div class="form-group">
              <label for="email">{{ 'orderModal.email' | translate }}</label>
              <input
                type="email"
                id="email"
                name="email"
                [ngModel]="email"
                (ngModelChange)="onEmailChange($event)"
                required
                email
                pattern="^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$"
                placeholder="{{ 'orderModal.emailPlaceholder' | translate }}"
                #emailInput="ngModel"
              >
              @if (emailInput.invalid && (emailInput.dirty || emailInput.touched)) {
                @if (emailInput.errors?.['required']) {
                  <div class="error-message">
                    {{ 'orderModal.emailRequiredError' | translate }}
                  </div>
                } @else if (emailInput.errors?.['pattern']) {
                  <div class="error-message">
                    {{ 'orderModal.emailError' | translate }}
                  </div>
                }
              }
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn--ghost" (click)="close()">
                {{ 'orderModal.cancel' | translate }}
              </button>
              <button
                type="submit"
                class="btn btn--primary"
                [disabled]="isSubmitting()"
              >
                {{ isSubmitting() ? ('orderModal.processing' | translate) : ('orderModal.submit' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class OrderModalComponent implements OnInit {
  @ViewChild('orderForm') orderForm!: NgForm;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private readonly storageKeyEmail = 'denumismat.email';
  private readonly storageKeyName = 'denumismat.name';

  coins = input<Coin[]>([]);
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  onClose = output<void>();
  onSubmit = output<{ name: string; email: string; coins: Coin[] }>();

  name = '';
  email = '';
  isSubmitting = signal(false);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedEmail = localStorage.getItem(this.storageKeyEmail);
      const savedName = localStorage.getItem(this.storageKeyName);

      if (savedEmail) this.email = savedEmail;
      if (savedName) this.name = savedName;

      if (savedEmail || savedName) {
        this.cdr.markForCheck();
      }
    }
  }

  onNameChange(value: string) {
    this.name = value;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKeyName, value);
    }
  }

  onEmailChange(value: string) {
    this.email = value;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKeyEmail, value);
    }
  }

  totalAmount = computed(() => {
    return this.coins().reduce((sum, coin) => sum + coin.price, 0);
  });

  close() {
    this.onClose.emit();
  }

  submitOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call or just event emit
    setTimeout(() => {
      this.onSubmit.emit({
        name: this.name,
        email: this.email,
        coins: this.coins()
      });
      this.isSubmitting.set(false);
    }, 500);
  }
}
