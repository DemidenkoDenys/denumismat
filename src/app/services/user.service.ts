import { firestore } from '../config/firebase.config';
import { Injectable } from '@angular/core';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { from, Observable, map, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly coinDoc = (id: number) => doc(firestore, 'coins', id.toString());
  private readonly statusesDoc = doc(firestore, 'statuses', 'coin_statuses');

  bookCoin(coinId: string, email: string): Observable<any> {
    return from(updateDoc(this.statusesDoc, { [coinId]: { ba: new Date().toISOString(), bb: email } }));
  }

  orderCoin(coinId: number, email: string): Observable<any> {
    return forkJoin({
      delete: from(updateDoc(this.coinDoc(coinId), { is_deleted: new Date().toISOString() })),
      status: from(updateDoc(this.statusesDoc, { [coinId]: { oa: new Date().toISOString(), ob: email } })),
    })
  }

  /**
   * Get user document by email (document id = email). Returns null if not found.
   */
  getUserByEmail(email: string): Observable<any | null> {
    if (!email) return from(Promise.resolve(null));
    const docRef = doc(firestore, 'users', email);
    return from(getDoc(docRef)).pipe(
      map(snapshot => (snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null))
    );
  }

  /**
   * Create or update user document under `users/{email}`. If `generateVerification` is true
   * a 6-digit verificationCode will be created and saved on the document; the method returns
   * the saved verificationCode when generated.
   */
  saveUserByEmail(user: any, generateVerification = false): Observable<{ verificationCode?: string } | void> {
    const email = user?.email;
    if (!email) return from(Promise.reject(new Error('Email is required')));

    const userDocRef = doc(firestore, 'users', email);
    const payload: any = { ...user };

    if (generateVerification) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      payload.verificationCode = code;
      payload.verified = false;
      return from(setDoc(userDocRef, payload, { merge: true })).pipe(map(() => ({ verificationCode: code })));
    }

    // No verification generation — just merge/update the document
    return from(setDoc(userDocRef, payload, { merge: true }));
  }

  /**
   * Mark user as verified and remove verificationCode field (merge update).
   */
  markUserVerified(email: string): Observable<void> {
    const userDocRef = doc(firestore, 'users', email);
    return from(setDoc(userDocRef, { verified: true, verificationCode: null }, { merge: true }));
  }
}
