import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const VIEWED_COINS = 'viewedCoins';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private platformId = inject(PLATFORM_ID);

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId) || !('indexedDB' in window)) {
        return reject(new Error('IndexedDB not available'));
      }

      const req = indexedDB.open('denumismat', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('app')) {
          db.createObjectStore('app');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Mark a coin id as viewed by writing/updating the object stored under key 'viewedCoinsMap'
   * in the 'app' object store: { [coinId]: true }
   */
  async markViewed(coinId: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const db = await this.openDb();
      const tx = db.transaction('app', 'readwrite');
      const store = tx.objectStore('app');

      const current: Record<string, boolean> = await new Promise((resolve, reject) => {
        const req = store.get(VIEWED_COINS);
        req.onsuccess = () => resolve(req.result || {});
        req.onerror = () => reject(req.error);
      });

      if (current[coinId]) {
        db.close();
        return; // already marked
      }

      current[coinId] = true;
      store.put(current, VIEWED_COINS);

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      });

      db.close();
    } catch (err) {
      console.error('IndexedDbService.markViewed error', err);
    }
  }

  /**
   * Read the viewedCoinsMap from IndexedDB.
   */
  async getViewedCoinsMap(): Promise<Record<string, boolean>> {
    if (!isPlatformBrowser(this.platformId)) return {};
    try {
      const db = await this.openDb();
      const tx = db.transaction('app', 'readonly');
      const store = tx.objectStore('app');

      const result: Record<string, boolean> = await new Promise((resolve, reject) => {
        const req = store.get(VIEWED_COINS);
        req.onsuccess = () => resolve(req.result || {});
        req.onerror = () => reject(req.error);
      });

      db.close();
      return result;
    } catch (err) {
      console.error('IndexedDbService.getViewedCoinsMap error', err);
      return {};
    }
  }
}
