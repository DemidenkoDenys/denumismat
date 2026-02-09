import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from './auth.models';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  login$ = createEffect(() =>
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

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) => of(AuthActions.logoutFailure({ error: error.message })))
        )
      )
    )
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
