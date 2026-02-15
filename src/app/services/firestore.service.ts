import { Injectable } from '@angular/core';
import { collection, doc, query, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  // Real-time слухачі (для live updates)
  listenToCollection(collectionName: string, constraints: QueryConstraint[] = []): Observable<any[]> {
    return new Observable(observer => {
      const collectionRef = collection(firestore, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : query(collectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(data);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  // Real-time слухач для одного документа
  listenToDocument(collectionName: string, docId: string): Observable<any> {
    return new Observable(observer => {
      const docRef = doc(firestore, collectionName, docId);

      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          observer.next({ id: snapshot.id, ...snapshot.data() });
        } else {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }
}
