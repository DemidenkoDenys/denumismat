import { CanActivateFn } from '@angular/router';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import { AUTH } from '../app.constants';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const authAdminGuard: CanActivateFn = () => new Promise((resolve) => {
  onAuthStateChanged(getAuth(), async (user) => {
    const document = await getDoc(doc(firestore, atob(AUTH)));
    resolve(Boolean(user && document.exists() && user.uid === atob(document.data()['uid'])));
  });
});
