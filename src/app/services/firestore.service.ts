import { Injectable } from '@angular/core';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Query,
  QueryConstraint
} from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor() {}

  // Додати документ до колекції
  addDocument(collectionName: string, data: any) {
    const collectionRef = collection(firestore, collectionName);
    return from(addDoc(collectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  // Оновити документ
  updateDocument(collectionName: string, docId: string, data: any): Observable<any> {
    const docRef = doc(firestore, collectionName, docId);
    return from(updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    }));
  }

  // Видалити документ
  deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(firestore, collectionName, docId);
    return deleteDoc(docRef);
  }

  // Отримати всі документи з колекції
  async getDocuments(collectionName: string) {
    const collectionRef = collection(firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Отримати один документ по ID
  async getDocument(collectionName: string, docId: string) {
    const docRef = doc(firestore, collectionName, docId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  }

  // Запит з фільтрацією
  async queryDocuments(collectionName: string, constraints: QueryConstraint[]) {
    const collectionRef = collection(firestore, collectionName);
    const q = query(collectionRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

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
