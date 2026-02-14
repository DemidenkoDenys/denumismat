import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, map } from 'rxjs';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase.config';
import { AUTH } from '../app.constants';

export const authAdminGuard: CanActivateFn = () => {
  const router = inject(Router);

  return from(getDoc(doc(firestore, atob(AUTH)))).pipe(
    map(snapshot => {
      if (snapshot.exists()) {
        const user = localStorage.getItem('auth_google_user');
        return Boolean(user && JSON.parse(user).uid === atob(snapshot.data()['uid']));
      }
      router.navigate(['/']);
      return false;
    }))
};
