import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as ShippingActions from './shipping.actions';
import { FirestoreService } from '../services/firestore.service';

@Injectable()
export class ShippingEffects {
  private actions$ = inject(Actions);
  private firestoreService = inject(FirestoreService); // Make sure FirestoreService is imported

  loadShippingMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShippingActions.loadShippingMethods),
      switchMap(() => {
        return this.firestoreService.listenToCollection('shipping').pipe(
          map(methods => ShippingActions.loadShippingMethodsSuccess({ methods })),
          catchError(error => of(ShippingActions.loadShippingMethodsFailure({ error })))
        );
      })
    )
  );
}
