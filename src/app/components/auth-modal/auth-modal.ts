import { Component, ChangeDetectionStrategy, output, signal, inject, ViewChild, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, effect, Renderer2, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (mousedown)="onBackdropMouseDown($event)" (mouseup)="onBackdropMouseUp($event)">
      <div class="modal-container" (mousedown)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ 'authModal.title' | translate }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <form (ngSubmit)="submit()" #authForm="ngForm" class="modal-body">
          <div class="form-group">
            <label for="name">{{ 'authModal.name' | translate }}</label>
            <input
              type="text"
              id="name"
              name="name"
              [ngModel]="name"
              (ngModelChange)="onNameChange($event)"
              [disabled]="!!currentUser()?.displayName"
              required
              placeholder="{{ 'authModal.namePlaceholder' | translate }}"
              #nameInput="ngModel"
            >
            @if (nameInput.invalid && (nameInput.dirty || nameInput.touched) && nameInput.errors?.['required']) {
              <div class="error-message">
                {{ 'authModal.nameRequiredError' | translate }}
              </div>
            }
          </div>

          <div class="form-group">
            <label for="email">{{ 'authModal.email' | translate }}</label>
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
              placeholder="{{ 'authModal.emailPlaceholder' | translate }}"
              #emailInput="ngModel"
            >
            @if (emailInput.invalid && (emailInput.dirty || emailInput.touched)) {
              @if (emailInput.errors?.['required']) {
                <div class="error-message">
                  {{ 'authModal.emailRequiredError' | translate }}
                </div>
              } @else if (emailInput.errors?.['pattern']) {
                <div class="error-message">
                  {{ 'authModal.emailError' | translate }}
                </div>
              }
            }
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn--ghost" (click)="close()">
              {{ 'authModal.cancel' | translate }}
            </button>
            <button
              type="submit"
              class="btn btn--primary"
              [disabled]="isSubmitting()"
            >
              {{ isSubmitting() ? ('authModal.processing' | translate) : ('authModal.submit' | translate) }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AuthModalComponent implements OnInit, OnDestroy {
  @ViewChild('authForm') authForm!: NgForm;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  currentUser = toSignal(this.store.select(selectUser));

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
  }

  private readonly storageKeyEmail = 'denumismat.email';
  private readonly storageKeyName = 'denumismat.name';

  onClose = output<void>();
  onSubmit = output<{ name: string; email: string }>();
  onAuthSuccess = output<void>();

  name = '';
  email = '';
  isSubmitting = signal(false);
  private isBackdropMouseDown = false;

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

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

  close() {
    this.onClose.emit();
  }

  submit() {
    if (this.authForm.invalid) {
      this.authForm.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call or just event emit
    setTimeout(() => {
      this.onSubmit.emit({
        name: this.name,
        email: this.email
      });
      this.onAuthSuccess.emit();
      this.isSubmitting.set(false);
    }, 500);
  }
}
