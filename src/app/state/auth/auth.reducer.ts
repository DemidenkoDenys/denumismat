import { createReducer, on } from '@ngrx/store';
import { AuthState, User } from './auth.models';
import * as AuthActions from './auth.actions';

const getUserFromStorage = (): User | null => {
  try {
    const storedUser = localStorage.getItem('auth_google_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const initialState: AuthState = {
  user: getUserFromStorage(),
  loading: false,
  error: null,
  isAdmin: false,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginWithGoogle, (state) => ({ ...state, verified: true, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AuthActions.logout, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.logoutSuccess, (state) => ({ ...state, verified: false, user: null, loading: false })),
  on(AuthActions.logoutFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AuthActions.setAuthUser, (state, { user }) => ({ ...state, user })),
  on(AuthActions.setIsAdmin, (state, { isAdmin }) => ({ ...state, isAdmin })),
  on(AuthActions.setVerified, (state, { verified }) => ({ ...state, verified }))
);
