import { Component, ChangeDetectionStrategy, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { MainLayoutComponent } from '../../main-layout';
import { selectIsLoggedIn, selectIsAdmin } from '../../state/auth/auth.selectors';
import { loginWithGoogle, setAuthUser, setIsAdmin } from '../../state/auth/auth.actions';
import { TranslateModule } from '@ngx-translate/core';
import { UserSelectionBarComponent } from '../user-selection-bar/user-selection-bar';

@Component({
  selector: 'user-wrapper',
  standalone: true,
  imports: [CommonModule, MainLayoutComponent, UserSelectionBarComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-wrapper">
      <app-main-layout></app-main-layout>
      <user-selection-bar></user-selection-bar>
    </div>
  `,
})
export class UserWrapperComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });

  ngOnInit() {
    // Clear auth state and stored credentials when entering admin route
    this.clearAuthData();
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
