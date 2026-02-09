import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject, ViewChild, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, effect, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';
import { Coin } from '../coins/coin-card';
import { PricePipe } from '../../pipes/price.pipe';

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
                [disabled]="!!currentUser()?.displayName"
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
                [disabled]="!!currentUser()?.email"
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
export class OrderModalComponent implements OnInit, OnDestroy {
  @ViewChild('orderForm') orderForm!: NgForm;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  currentUser = toSignal(this.store.select(selectUser));
  excludedIds = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user?.email) {
        this.email = user.email;
        if (user.displayName) {
          this.name = user.displayName;
        }
        this.cdr.markForCheck();
      }
    });

     // Reset excluded coins when the coins list changes
    effect(() => {
      const c = this.coins();
      // Start with all coins excluded (unchecked)
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
  submitted = signal(false);
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

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');

      const savedEmail = localStorage.getItem(this.storageKeyEmail);
      const savedName = localStorage.getItem(this.storageKeyName);

      if (savedEmail) this.email = savedEmail;
      if (savedName) this.name = savedName;

      if (savedEmail || savedName) {
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeStyle(this.document.body, 'overflow');
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
    return this.coins()
      .filter(c => !this.excludedIds().has(c.id))
      .reduce((sum, coin) => sum + coin.price, 0);
  });

  close() {
    this.onClose.emit();
  }

  submitOrder() {
    this.submitted.set(true);

    if (this.orderForm.invalid) {
      this.orderForm.form.markAllAsTouched();
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
        name: this.name,
        email: this.email,
        coins: finalCoins
      });
      this.isSubmitting.set(false);
    }, 500);
  }
}
