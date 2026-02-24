import { Injectable } from '@angular/core';
import { firestore } from '../config/firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import { forkJoin, from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  deleteCoin(coinId: string): Observable<any> {
    return forkJoin({
      coin: from(updateDoc(doc(firestore, 'coins', coinId), { is_deleted: new Date().toISOString() })),
      statuses: from(updateDoc(doc(firestore, 'statuses', 'coin_statuses'), { [coinId]: {} }))
    });
  }

  restoreCoin(coinId: string): Observable<any> {
    return forkJoin({
      coin: from(updateDoc(doc(firestore, 'coins', coinId), { is_deleted: null })),
      statuses: from(updateDoc(doc(firestore, 'statuses', 'coin_statuses'), { [coinId]: { ba: null, bb: null, oa: null, ob: null } }))
    });
  }
}
