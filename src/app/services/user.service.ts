import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestoreService = inject(FirestoreService);

  constructor() { }

  createDocument(collectionName: string, data: any) {
    return this.firestoreService.addDocument(collectionName, data);
  }
}
