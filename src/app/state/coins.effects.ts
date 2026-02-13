import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, concatMap } from 'rxjs/operators';
import * as CoinsActions from './coins.actions';
import { FirestoreService } from '../services/firestore.service';
import { Coin } from '../components/coins/coin-card';

@Injectable()
export class CoinsEffects {
  private actions$ = inject(Actions);
  private firestoreService = inject(FirestoreService);

  loadCoins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoinsActions.loadCoins),
      switchMap(() =>
        this.firestoreService.listenToCollection('coins').pipe(
          concatMap((coins: Coin[]) => {
            const coinsWithDiscount = coins.map((coin) => ({ ...coin, discountPrice: Math.round(coin.price * 90) / 100 }));
            const coinCountriesMap = coinsWithDiscount.reduce((acc, coin) => ({ ...acc, [coin.country]: coin }), {} as Record<string, Coin>);
            return of(
              CoinsActions.loadCoinsSuccess({ coins: coinsWithDiscount }),
              CoinsActions.setCoinCountries({ countries: coinCountriesMap }),
            );
          }),
          catchError((error) => {
            console.error('Error fetching coins:', error);
            return of(CoinsActions.loadCoinsFailure({ error }));
          })
        )
      )
    )
  );
}
