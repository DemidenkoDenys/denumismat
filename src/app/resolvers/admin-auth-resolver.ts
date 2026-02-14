import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { setAuthUser, setIsAdmin } from '../state/auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthResolver implements Resolve<boolean> {
  private store = inject(Store);

  resolve(): Observable<boolean> {
    // Reset auth state when entering admin route
    this.clearAuthData();

    // Set admin status to true for admin route access
    this.store.dispatch(setIsAdmin({ isAdmin: true }));

    return of(true);
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
}
