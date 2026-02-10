import { createAction, props } from '@ngrx/store';
import { User } from './auth.models';

export const loginWithGoogle = createAction('[Auth] Login with Google');
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction('[Auth] Logout Failure', props<{ error: string }>());

export const checkAuth = createAction('[Auth] Check Auth');
export const setAuthUser = createAction('[Auth] Set Auth User', props<{ user: User | null }>());
export const setIsAdmin = createAction('[Auth] Set Is Admin', props<{ isAdmin: boolean }>());
