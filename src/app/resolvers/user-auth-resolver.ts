import { Injectable, inject } from '@angular/core';
import { Resolve } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { setAuthUser, setIsAdmin } from '../state/auth/auth.actions';

@Injectable({
  providedIn: 'root',
})
export class UserAuthResolver implements Resolve<boolean> {
  private store = inject(Store);

  resolve(): Observable<boolean> {
    this.store.dispatch(setIsAdmin({ isAdmin: false }));
    return of(true);
  }
}
