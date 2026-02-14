import { Injectable } from '@angular/core';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  unbookCoin(coinId: string): Observable<any> {
    const document = doc(firestore, 'coins', coinId);
    return from(updateDoc(document, { booked_at: null, booked_by: null }));
  }

  deleteCoin(coinId: string): Observable<any> {
    const document = doc(firestore, 'coins', coinId);
    return from(updateDoc(document, { is_deleted: new Date().toISOString() }));
  }

  restoreCoin(coinId: string): Observable<any> {
    const document = doc(firestore, 'coins', coinId);
    return from(updateDoc(document, { is_deleted: null, booked_at: null, booked_by: null, ordered_at: null, ordered_by: null }));
  }
}
