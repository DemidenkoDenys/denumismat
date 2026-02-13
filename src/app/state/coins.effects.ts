import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from } from 'rxjs';
import { map, catchError, switchMap, concatMap } from 'rxjs/operators';
import * as CoinsActions from './coins.actions';
import { FirestoreService } from '../services/firestore.service';
import { Coin } from '../components/coins/coin-card';
import { IndexedDbService } from '../services/indexed-db.service';

@Injectable()
export class CoinsEffects {
  private actions$ = inject(Actions);
  private indexedDb = inject(IndexedDbService);
  private firestoreService = inject(FirestoreService);

  loadCoins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoinsActions.loadCoins),
      switchMap(() =>
        this.firestoreService.listenToCollection('coins').pipe(
          concatMap((coins: Coin[]) => {
            return from(this.indexedDb.getViewedCoinsMap()).pipe(
              map((viewedMap: Record<string, boolean>) => {
                const mappedCoins = coins.map((coin) => {
                  const tags = coin.tags ?? [];
                  if (viewedMap && Object.keys(viewedMap).length > 0 && !viewedMap[coin.id]) {
                    tags.unshift('new');
                  }
                  return { ...coin, tags, discountPrice: Math.round(coin.price * 90) / 100 };
                });
                const coinCountriesMap = mappedCoins.reduce((acc, coin) => ({ ...acc, [coin.country]: true }), {} as Record<string, boolean>);
                return [
                  CoinsActions.loadCoinsSuccess({ coins: mappedCoins }),
                  CoinsActions.setCoinCountries({ countries: coinCountriesMap }),
                ];
              }),
              concatMap((actionsArray) => of(...actionsArray))
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
