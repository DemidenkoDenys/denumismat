import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, concatMap } from 'rxjs/operators';
import * as CoinsActions from './coins.actions';
import { FirestoreService } from '../services/firestore.service';
import { Coin } from '../components/coins/coin-card';
import { IndexedDbService } from '../services/indexed-db.service';
import { where } from 'firebase/firestore';

@Injectable()
export class AdminCoinsEffects {
  private actions$ = inject(Actions);
  private indexedDb = inject(IndexedDbService);
  private firestoreService = inject(FirestoreService);

  loadCoins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoinsActions.loadCoins),
      switchMap(() =>
        this.firestoreService.listenToCollection('coins').pipe(
          concatMap((coins: Coin[]) => {
            const mappedCoins = coins.map((coin) => {
              const tags = [];
              if (coin.booked_at) {
                tags.unshift('booked: ' + (coin.booked_by ?? '??'));
              }
              if (coin.ordered_at) {
                tags.unshift('ordered: ' + (coin.ordered_by ?? '??'));
              }
              return { ...coin, tags, discountPrice: Math.round(coin.price * 90) / 100 };
            });
            const coinCountriesMap = mappedCoins.reduce((acc, coin) => ({ ...acc, [coin.country]: true }), {} as Record<string, boolean>);
            return of(
              CoinsActions.loadCoinsSuccess({ coins: mappedCoins }),
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

  selectCoin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoinsActions.selectCoin),
        map(action => {
          const selectedCoin = action.coin;
          const storageKey = 'denumismat.coins';
          let storedCoinsMap: Record<string, boolean> = {};
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              storedCoinsMap = JSON.parse(raw);
            }
          } catch { }
          if (!storedCoinsMap[selectedCoin.id]) {
            storedCoinsMap[selectedCoin.id] = true;
            localStorage.setItem(storageKey, JSON.stringify(storedCoinsMap));
          }
        })
      ),
    { dispatch: false }
  );

  deselectCoin$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoinsActions.deselectCoin),
        map(action => {
          const deselectedCoinId = action.coinId;
          const storageKey = 'denumismat.coins';
          let storedCoinsMap: Record<string, boolean> = {};
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              storedCoinsMap = JSON.parse(raw);
            }
          } catch { }
          if (storedCoinsMap[deselectedCoinId]) {
            delete storedCoinsMap[deselectedCoinId];
            localStorage.setItem(storageKey, JSON.stringify(storedCoinsMap));
          }
        })
      ),
    { dispatch: false }
  );

  clearSelection$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CoinsActions.clearSelection),
        map(() => {
          const storageKey = 'denumismat.coins';
          localStorage.removeItem(storageKey);
        })
      ),
    { dispatch: false }
  );
}
