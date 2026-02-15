import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AUTH_EMAIL_USER, AUTH_GOOGLE_USER, AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from './auth.models';
import { selectBookedCoinsByEmail } from '../coins.actions';

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
              verified: true,
              photoURL: firebaseUser.photoURL
            };
            return AuthActions.loginSuccess({ user });
          }),
          catchError((error) => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => {
            localStorage.removeItem(AUTH_EMAIL_USER);
            localStorage.removeItem(AUTH_GOOGLE_USER);
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
      tap(() => this.router.navigate(['/'])),
      map(() => selectBookedCoinsByEmail({ email: null }))
    ),
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      switchMap(() => this.authService.getGoogleAuthState()),
      switchMap((googleUser) => {
        if (googleUser) {
          return of(AuthActions.setAuthUser({
            user: {
              uid: googleUser.uid,
              email: googleUser.email,
              photoURL: googleUser.photoURL,
              verified: true,
              displayName: googleUser.displayName,
            }
          }));
        }

        return this.authService.getEmailAuthState().pipe(
          map((emailUser) => {
            const user = emailUser?.data();
            if (user) {
              return AuthActions.setAuthUser({
                user: {
                  uid: user.uid,
                  email: user.email,
                  photoURL: null,
                  verified: true,
                  displayName: user.displayName,
                }
              });
            }
            return AuthActions.setAuthUser({ user: null });
          })
        )
      })
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
