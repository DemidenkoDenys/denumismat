import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from './auth.models';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginWithGoogle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginWithGoogle),
      switchMap(() =>
        this.authService.loginWithGoogle().pipe(
          map((firebaseUser) => {
             const user: User = {
               uid: firebaseUser.uid,
               displayName: firebaseUser.displayName,
               email: firebaseUser.email,
               photoURL: firebaseUser.photoURL
             };
             return AuthActions.loginSuccess({ user });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  syncStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.setAuthUser),
      tap(({ user }) => {
        if (user) {
          localStorage.setItem('auth_user_profile', JSON.stringify(user));
        } else {
          localStorage.removeItem('auth_user_profile');
        }
      })
    ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => {
             localStorage.removeItem('auth_user_profile');
             localStorage.removeItem('denumismat.email');
             localStorage.removeItem('denumismat.name');
             return AuthActions.logoutSuccess();
          }),
          catchError((error) => of(AuthActions.logoutFailure({ error: error.message })))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.router.navigate(['/']);
      })
    ),
    { dispatch: false }
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() =>
        this.authService.getAuthState().pipe(
           map(firebaseUser => {
             if (firebaseUser) {
                const user: User = {
                   uid: firebaseUser.uid,
                   displayName: firebaseUser.displayName,
                   email: firebaseUser.email,
                   photoURL: firebaseUser.photoURL
                 };
                 return AuthActions.setAuthUser({ user });
             } else {
                 return AuthActions.setAuthUser({ user: null });
             }
           })
        )
      )
    )
  );

  // Automatically check auth status on startup
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType('@ngrx/effects/init'),
      map(() => AuthActions.checkAuth())
    )
  );
}
