import { Component, ChangeDetectionStrategy, output, signal, inject, ViewChild, PLATFORM_ID, ChangeDetectorRef, effect, Renderer2 } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectUser } from '../../state/auth/auth.selectors';
import { loginWithGoogle } from '../../state/auth/auth.actions';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthForm } from '../auth-form/auth-form';
import { BaseModalComponent } from '../base-modal/base-modal';
import { UserService } from '../../services/user.service';

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

        @if (verifyError()) {
          <div class="error-message auth-verify-error">{{ verifyError() }}</div>
        }

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
export class AuthModalComponent {
  @ViewChild(AuthForm) authFormComponent!: AuthForm;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private modalService = inject(AuthModalService);
  private userService = inject(UserService);

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

    // Watch for user changes and close modal when authorized by Google (but not in admin mode)
    effect(() => {
      const user = this.currentUser();
      if (user && !this.isAdminMode()) {
        // User is authorized by Google and not in admin mode, close the modal
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
  isAdminMode = signal(false);
  isSubmitting = signal(false);
  isEmailDisabled = signal(false);

  // Show verify-code input when a stored code exists
  showVerifyInput = signal(false);
  verifyError = signal('');

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
    // Reset verification UI when the email is edited
    this.showVerifyInput.set(false);
    this.verifyError.set('');
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
    console.log(this.authFormComponent.authForm);

    if (this.authFormComponent.authForm.invalid) {
      this.authFormComponent.showValidationErrors();
      return;
    }

    localStorage.setItem('denumismat.name', this.name);
    localStorage.setItem('denumismat.email', this.email);

    this.isSubmitting.set(true);
    this.verifyError.set('');

    const email = this.email?.trim();
    const payloadUser = {
      uid: `local-${Date.now()}`,
      email,
      verified: false,
      displayName: this.name,
    };

    // If verify-input is already visible, user is attempting to verify code
    if (this.showVerifyInput()) {
      this.userService.getUserByEmail(email).subscribe({
        next: (doc) => {
          console.log("🚀 ~ doc:", doc)
          const storedCode = (doc && doc.code) ? String(doc.code) : null;
          const entered = (this.verifyCode || '').replace(/\D/g, '');
          if (!storedCode) {
            this.verifyError.set('No verification code was found for this user.');
            this.isSubmitting.set(false);
            return;
          }

          if (storedCode === entered) {
            // mark verified in Firestore and proceed
            this.userService.markUserVerified(email).subscribe({
              next: () => {
                this.onSubmit.emit({ name: this.name, email: this.email, verifyCode: this.verifyCode });
                this.onAuthSuccess.emit();
                this.isSubmitting.set(false);
              },
              error: (err) => {
                console.error('Failed to mark verified:', err);
                this.verifyError.set('Failed to verify — try again later.');
                this.isSubmitting.set(false);
              }
            });
          } else {
            this.verifyError.set('Verification code does not match.');
            this.isSubmitting.set(false);
          }
        },
        error: (err) => {
          console.error('Error reading user doc:', err);
          this.verifyError.set('Verification failed — please try again.');
          this.isSubmitting.set(false);
        }
      });

      return;
    }

    // First submission attempt: check if user exists
    this.userService.getUserByEmail(email).subscribe({
      next: (doc) => {
        console.log("🚀 ~ doc:", doc)
        if (doc) {
          // user exists — if they have a code, show verify input
          if (doc.code) {
            this.showVerifyInput.set(true);
            this.isSubmitting.set(false);
            return;
          }

          // exists but no verification code -> update/merge user doc and proceed
          this.userService.saveUserByEmail(payloadUser, false).subscribe({
            next: () => {
              this.onSubmit.emit({ name: this.name, email: this.email, verifyCode: this.verifyCode });
              this.onAuthSuccess.emit();
              this.isSubmitting.set(false);
            },
            error: (err) => {
              console.error('Failed to save existing user:', err);
              this.isSubmitting.set(false);
            }
          });
        } else {
          // user does not exist -> create with verification code, then show verify input
          this.userService.saveUserByEmail(payloadUser, true).subscribe({
            next: (res: any) => {
              // we created the user and generated a verification code — prompt for it
              this.showVerifyInput.set(true);
              this.isSubmitting.set(false);
            },
            error: (err) => {
              console.error('Failed to create user:', err);
              this.isSubmitting.set(false);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error checking user existence:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  // Additional methods for auth modal functionality
  resetForm() {
    this.name = '';
    this.email = '';
    this.verifyCode = '';
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
    return Boolean(this.authFormComponent.authForm.valid && !this.isSubmitting());
  }
}
