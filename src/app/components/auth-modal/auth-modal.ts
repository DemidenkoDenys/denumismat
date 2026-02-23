import { Component, ChangeDetectionStrategy, output, signal, inject, ViewChild, ChangeDetectorRef, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';
import { loginSuccess, loginWithGoogle } from '../../state/auth/auth.actions';
import { AuthForm } from '../auth-form/auth-form';
import { BaseModalComponent } from '../base-modal/base-modal'; import { AuthService } from '../../services/auth.service';
import { selectBookedCoinsByEmail } from '../../state/coins.actions';
import { NotificationService } from '../../services/api.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AuthForm, BaseModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-base-modal [title]="'authModal.title' | translate" (onClose)="close()">
      <div class="auth-modal-content">
        @if (isAdminMode()) {
          <div class="admin-notice">
            <p>{{ 'authModal.adminRequired' | translate }}</p>
          </div>
        }

        <app-auth-form
          [name]="name"
          [email]="email"
          [verifyCode]="verifyCode"
          [emailDisabled]="isEmailDisabled()"
          [showVerifyInput]="showVerifyInput()"
          (verifyCodeChange)="onVerifyCodeChange($event)"
          (emailChange)="onEmailChange($event)"
          (nameChange)="onNameChange($event)"
          (submitForm)="onFormSubmit($event)"
        ></app-auth-form>

        <div class="modal-actions">
          <button type="button" class="btn btn--ghost" (click)="close()">
            {{ 'authModal.cancel' | translate }}
          </button>

          <button type="button" class="btn btn--google" (click)="signInWithGoogle()" title="{{ 'authModal.googleSignIn' | translate }}">
            Google
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>

          <button type="button" class="btn btn--primary" (click)="submit()">
            {{ 'authModal.submit' | translate }}
          </button>
        </div>
      </div>
    </app-base-modal>
  `
})
export class AuthModalComponent {
  @ViewChild(AuthForm) authFormComponent!: AuthForm;
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentUser = toSignal(this.store.select(selectUser));

  constructor() {
    effect(() => {
      const user = this.currentUser();
      const storageEmailUser = this.authService.getEmailStorageUser();
      this.name = user?.displayName ?? storageEmailUser?.name ?? '';
      this.email = user?.email ?? storageEmailUser?.email ?? '';
      this.cdr.markForCheck();
    });

    // Watch for user changes and close modal when authorized by Google (but not in admin mode)
    effect(() => {
      const user = this.currentUser();
      if (user && !this.isAdminMode()) {
        this.store.dispatch(selectBookedCoinsByEmail({ email: user.email }));
        this.close();
      }
    });
  }

  onClose = output<void>();
  onSubmit = output<{ name: string; email: string; verifyCode: string }>();
  onAuthSuccess = output<void>();

  name = '';
  email = '';
  verifyCode = '';
  verifyError = signal('');
  isAdminMode = signal(false);
  isEmailDisabled = signal(false);
  showVerifyInput = signal(false);

  setAdminMode(adminMode: boolean) {
    this.isAdminMode.set(adminMode);
  }

  onNameChange(value: string) {
    this.name = value;
  }

  onEmailChange(value: string) {
    this.email = value;
    this.showVerifyInput.set(false);
  }

  onVerifyCodeChange(value: string) {
    this.verifyCode = value;
  }

  onFormSubmit(formData: { name: string; email: string; verifyCode: string }) {
    this.name = formData.name;
    this.email = formData.email;
    this.verifyCode = formData.verifyCode;
    this.submit();
  }

  get code(): string {
    return this.verifyCode?.replace('-', '');
  }

  close() {
    this.onClose.emit();
  }

  signInWithGoogle() {
    this.store.dispatch(loginWithGoogle());
  }

  submit() {
    if (this.authFormComponent.authForm.invalid) {
      this.authFormComponent.showValidationErrors();
      return;
    }

    if (this.authService.isEmailValid(this.email) && !this.showVerifyInput()) {
      const code = this.authService.setVerifyCode();
      this.showVerifyInput.set(!!code);
      this.notificationService.sendVerifyCode(this.email, code).subscribe();
      this.authService.setStorageEmailUser(this.name, this.email);
      return;
    }

    this.verifyError.set('');
    this.authService.loginWithEmail(this.name, this.email).subscribe({
      next: (user) => {
        this.authService.resetVerifyCode();
        this.store.dispatch(loginSuccess({ user }));
        this.store.dispatch(selectBookedCoinsByEmail({ email: user.email }));
        this.close();
      },
      error: (err) => {
        console.error('Email login error:', err);
        this.verifyError.set('Failed to login with email — please try again.');
      }
    });
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.verifyCode = '';
  }

  prefillUserData(user: { name?: string; email?: string }) {
    if (user.name) {
      this.name = user.name;
    }
    if (user.email) {
      this.email = user.email;
      this.isEmailDisabled.set(true);
    }
  }

  enableEmailField() {
    this.isEmailDisabled.set(false);
  }

  disableEmailField() {
    this.isEmailDisabled.set(true);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }
}
