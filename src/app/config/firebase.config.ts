import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { environment } from '../../environments/environment';

export const app = initializeApp(environment.firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
export const firestore = initializeFirestore(app, { localCache: persistentLocalCache({}) });
