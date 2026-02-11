import { Injectable, inject } from '@angular/core';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private firestoreService = inject(FirestoreService);

  constructor() {}

  /**
   * Create a document in Firebase Firestore
   * @param collectionName The name of the collection
   * @param data The document data to create
   * @returns Promise with the document reference
   */
  createDocument(collectionName: string, data: any) {
    return this.firestoreService.addDocument(collectionName, data);
  }
}
