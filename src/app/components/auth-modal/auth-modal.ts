import { Component, ChangeDetectionStrategy, output, signal, inject, ViewChild, OnInit, OnDestroy, PLATFORM_ID, ChangeDetectorRef, effect, Renderer2, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';
import { loginWithGoogle, setIsAdmin } from '../../state/auth/auth.actions';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthForm } from '../auth-form/auth-form';
import { BaseModalComponent } from '../base-modal/base-modal';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, AuthForm, BaseModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-base-modal [title]="getModalTitle()" (onClose)="close()">
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
          (nameChange)="onNameChange($event)"
          (emailChange)="onEmailChange($event)"
          (verifyCodeChange)="onVerifyCodeChange($event)"
          (formValid)="isFormValid.set($event)"
          (submitForm)="onFormSubmit($event)"
        ></app-auth-form>

        <div class="modal-actions">
          <button type="button" class="btn btn--google" (click)="signInWithGoogle()" title="{{ 'authModal.googleSignIn' | translate }}">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          <button type="button" class="btn btn--ghost" (click)="close()">
            {{ 'authModal.cancel' | translate }}
          </button>
          <button
            type="button"
            class="btn btn--primary"
            [disabled]="isSubmitting()"
            (click)="submit()"
          >
            {{ isSubmitting() ? ('authModal.processing' | translate) : ('authModal.submit' | translate) }}
          </button>
        </div>
      </div>
    </app-base-modal>
  `
})
export class AuthModalComponent implements OnInit, OnDestroy {
  @ViewChild(AuthForm) authFormComponent!: AuthForm;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private modalService = inject(AuthModalService);

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

    // Watch for modal data changes to set admin mode
    effect(() => {
      const modalData = this.modalService.getAuthModalData();
      if (modalData?.mode === 'admin') {
        this.setAdminMode(true);
      } else {
        this.setAdminMode(false);
      }
    });

    // Watch for user changes and close modal when authorized by Google (but not in admin mode)
    effect(() => {
      const user = this.currentUser();
      if (user && !this.isAdminMode()) {
        // User is authorized by Google and not in admin mode, close the modal
        this.close();
      }
    });

    // Watch for user changes in admin mode and handle admin authentication
    effect(() => {
      const user = this.currentUser();
      if (user && this.isAdminMode()) {
        // Check if the current user is admin
        const isAdminUser = this.checkIfUserIsAdmin(user.email || '');
        if (isAdminUser) {
          // User is admin, dispatch admin status (don't close modal - let guard handle it)
          this.store.dispatch(setIsAdmin({ isAdmin: true }));
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  onClose = output<void>();
  onSubmit = output<{ name: string; email: string; verifyCode: string }>();
  onAuthSuccess = output<void>();

  name = '';
  email = '';
  verifyCode = '';
  isSubmitting = signal(false);
  isFormValid = signal(false);
  isEmailDisabled = signal(false);
  isAdminMode = signal(false);

  ngOnInit() {
    // Base modal handles body scroll prevention
  }

  ngOnDestroy() {
    // Base modal handles body scroll restoration
  }

  getModalTitle(): string {
    return this.isAdminMode() ? 'Admin Authentication' : 'authModal.title';
  }

  setAdminMode(adminMode: boolean) {
    this.isAdminMode.set(adminMode);
  }

  onNameChange(value: string) {
    this.name = value;
    // Don't save to localStorage - users should enter fresh data each time
  }

  onEmailChange(value: string) {
    this.email = value;
    // Don't save to localStorage - users should enter fresh data each time
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

  close() {
    this.onClose.emit();
  }

  signInWithGoogle() {
    this.store.dispatch(loginWithGoogle());
  }

  submit() {
    // Check if form is valid, if not, trigger validation display
    if (!this.isFormValid()) {
      this.authFormComponent.showValidationErrors();
      return;
    }

    this.isSubmitting.set(true);

    // Simulate API call or just event emit
    setTimeout(() => {
      this.onSubmit.emit({
        name: this.name,
        email: this.email,
        verifyCode: this.verifyCode
      });

      // If in admin mode, check if user becomes admin after authentication
      if (this.isAdminMode()) {
        // For demo purposes, we'll assume admin authentication succeeds
        // In real implementation, this would check against admin credentials
        this.handleAdminAuthentication();
      } else {
        this.onAuthSuccess.emit();
      }

      this.isSubmitting.set(false);
    }, 500);
  }

  private handleAdminAuthentication() {
    // Check if the authenticated user is admin
    // This would typically involve checking user credentials against admin list
    const isAdminUser = this.checkIfUserIsAdmin(this.email);

    if (isAdminUser) {
      // Dispatch admin authentication success
      this.store.dispatch(setIsAdmin({ isAdmin: true }));
      this.onAuthSuccess.emit();
    } else {
      // Show error for non-admin users
      console.error('User is not authorized as admin');
      // You could emit a different event or show an error message
    }
  }

  private checkIfUserIsAdmin(email: string): boolean {
    // Check if the current user has the admin UID
    const user = this.currentUser();
    if (user && user.uid === '4jv5yogz1AhqUb6ZojV6fScI9ZD2') {
      return true;
    }
    return false;
  }

  // Additional methods for auth modal functionality
  resetForm() {
    this.name = '';
    this.email = '';
    this.verifyCode = '';
    this.isFormValid.set(false);
    this.isSubmitting.set(false);
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

  isFormSubmitting(): boolean {
    return this.isSubmitting();
  }

  isFormReady(): boolean {
    return this.isFormValid() && !this.isSubmitting();
  }
}
