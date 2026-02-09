import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

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

  logout(): Observable<void> {
    return from(signOut(auth));
  }

  getAuthState(): Observable<FirebaseUser | null> {
    return new Observable(observer => {
      const unsubscribe = onAuthStateChanged(auth,
        (user) => observer.next(user),
        (error) => observer.error(error)
      );
      return () => unsubscribe();
    });
  }
}
