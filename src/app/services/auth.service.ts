import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, firestore } from '../config/firebase.config';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { decrypt, encrypt } from '../utils/cr.utils';

export const AUTH_EMAIL_USER = 'auth_email_user';
export const AUTH_GOOGLE_USER = 'auth_google_user';
export const AUTH_VERIFY_CODE = 'denumismat.verifyCode';

export const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() { }

  loginWithGoogle(): Observable<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(auth, provider)).pipe(
      map(result => result.user),
      catchError(error => {
        console.error('Google Login Error:', error);
        return throwError(() => error);
      })
    );
  }

  loginWithEmail(name: string, Email: string): Observable<any> {
    const email = Email.toLowerCase().trim();
    const user = {
      uid: `local-${Date.now()}`,
      email: email,
      verified: true,
      displayName: name.trim(),
    };
    return from(setDoc(doc(firestore, 'users', email), user)).pipe(map(() => user));
  }

  logout(): Observable<void> {
    return from(signOut(auth));
  }

  getGoogleAuthState(): Observable<FirebaseUser | null> {
    return new Observable(observer => {
      const unsubscribe = onAuthStateChanged(auth,
        (user) => observer.next(user),
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  getEmailStorageUser(): any {
    const storageEmailUser = localStorage.getItem(AUTH_EMAIL_USER);

    if (storageEmailUser) {
      let user: any;

      try {
        user = JSON.parse(storageEmailUser);
      } catch (e) {
        console.error('Failed to parse stored email user:', e);
        return null;
      }

      if (user && EMAIL_REGEXP.test(user.email)) {
        return user;
      } else {
        console.error('Invalid user email:', user);
        return null;
      }
    }

    return null;
  }

  getEmailAuthState(email?: string): Observable<any> {
    if (email?.toLowerCase()) {
      return from(getDoc(doc(firestore, 'users', email?.toLowerCase())));
    }

    const storageEmailUser = this.getEmailStorageUser();

    if (storageEmailUser) {
      return from(getDoc(doc(firestore, 'users', storageEmailUser.email.toLowerCase())));
    }

    return of(null);
  }

  setStorageEmailUser(name: string, email: string) {
    const user = { name, email };
    localStorage.setItem(AUTH_EMAIL_USER, JSON.stringify(user));
  }

  isEmailValid(email: string): boolean {
    return EMAIL_REGEXP.test(email);
  }

  setVerifyCode() {
    const code = localStorage.getItem(AUTH_VERIFY_CODE) ?? Math.floor(100000 + Math.random() * 900000).toString();
    const encryptedCode = encrypt(code);
    localStorage.setItem(AUTH_VERIFY_CODE, encryptedCode);
    return encryptedCode;
  }

  resetVerifyCode() {
    localStorage.removeItem(AUTH_VERIFY_CODE);
  }

  isVerifyCodeValid(code: string): boolean {
    const storedCode = localStorage.getItem(AUTH_VERIFY_CODE);
    return Boolean(storedCode && code.replace('-', '') === decrypt(storedCode));
  }
}
