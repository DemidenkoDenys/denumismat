import { firestore } from '../config/firebase.config';
import { Injectable } from '@angular/core';
import { doc, updateDoc } from 'firebase/firestore';
import { from, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  bookCoin(coinId: string, email: string): Observable<any> {
    const document = doc(firestore, 'coins', coinId);
    return from(updateDoc(document, { booked_at: new Date().toISOString(), booked_by: email }));
  }
}
