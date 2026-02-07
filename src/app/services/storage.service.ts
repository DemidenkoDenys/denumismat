import { Injectable } from '@angular/core';
import {
  ref,
  uploadBytes,
  deleteObject,
  getBytes,
  getMetadata,
  listAll,
  StorageReference
} from 'firebase/storage';
import { storage } from '../config/firebase.config';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  // Завантажити файл
  uploadFile(path: string, file: File) {
    const fileRef = ref(storage, path);
    return uploadBytes(fileRef, file);
  }

  // Видалити файл
  deleteFile(path: string) {
    const fileRef = ref(storage, path);
    return deleteObject(fileRef);
  }

  // Завантажити вміст файлу
  downloadFile(path: string) {
    const fileRef = ref(storage, path);
    return getBytes(fileRef);
  }

  // Отримати метадані файлу
  getFileMetadata(path: string) {
    const fileRef = ref(storage, path);
    return getMetadata(fileRef);
  }

  // Отримати список файлів у папці
  async listFiles(path: string) {
    const folderRef = ref(storage, path);
    const result = await listAll(folderRef);
    return {
      files: result.items.map(item => item.name),
      folders: result.prefixes.map(prefix => prefix.name)
    };
  }

  // Отримати URL для завантаження файлу
  async getDownloadUrl(path: string) {
    const fileRef = ref(storage, path);
    const { downloadTokens } = await getMetadata(fileRef);
    return `https://firebasestorage.googleapis.com/v0/b/${storage.bucket}/o/${encodeURIComponent(path)}?alt=media&token=${downloadTokens}`;
  }
}
