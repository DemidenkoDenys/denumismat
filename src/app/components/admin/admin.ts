import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MainLayoutComponent } from '../../main-layout';
import { selectIsLoggedIn, selectIsAdmin } from '../../state/auth/auth.selectors';
import { loginWithGoogle, logout, setAuthUser, setIsAdmin } from '../../state/auth/auth.actions';
import { TranslateModule } from '@ngx-translate/core';
import { AdminSelectionBarComponent } from '../admin-selection-bar/admin-selection-bar';
import { GoogleAuthButtonComponent } from '../google-auth-button/google-auth-button';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, AdminSelectionBarComponent, GoogleAuthButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-wrapper">
      @if (isLoggedIn()) {
        @if (isAdmin()) {
          <app-main-layout></app-main-layout>
          <admin-selection-bar></admin-selection-bar>
        } @else {
          {{ navigateToUserRoute() }}
        }
      } @else {
        <app-google-auth-button (onSignIn)="signInWithGoogle()"></app-google-auth-button>
      }
    </div>
  `,
  // skip styles: []
})
export class AdminComponent {
  private store = inject(Store);
  private router = inject(Router);

  isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });

  private clearAuthData() {
    // Clear localStorage items
    localStorage.removeItem('denumismat.name');
    localStorage.removeItem('denumismat.email');
    localStorage.removeItem('auth_user_profile');

    // Clear auth user from store
    this.store.dispatch(logout());
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
