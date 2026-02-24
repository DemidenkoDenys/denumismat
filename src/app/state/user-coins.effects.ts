import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, from, combineLatest } from 'rxjs';
import { map, catchError, switchMap, concatMap } from 'rxjs/operators';
import * as CoinsActions from './coins.actions';
import { FirestoreService } from '../services/firestore.service';
import { Coin } from '../components/coins/coin-card';
import { where } from 'firebase/firestore';
import { Store } from '@ngrx/store';
import { selectUser } from './auth/auth.selectors';
import { getDayDiff } from '../utils/date.utils';
import { isDefined } from '../utils/value.utils';
import { filter, orderBy, toUpper } from 'lodash';

@Injectable()
export class UserCoinsEffects {
  private store = inject(Store);
  private actions$ = inject(Actions);
  private firestoreService = inject(FirestoreService);

  loadCoins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CoinsActions.loadCoins),
      switchMap(() => {
        return combineLatest([
          this.firestoreService.listenToCollection('coins', [where("is_deleted", "==", null)]),
          this.firestoreService.listenToDocument('statuses', 'coin_statuses'),
          this.store.select(selectUser)
        ]).pipe(
          // return of(mockCoins as any).pipe(
          concatMap(([coins, statuses, user]: [Coin[], any, any]) => {
            const bookedCoins: Coin[] = [];
            const mappedCoins = orderBy(coins, ['created_at'], ['desc'])
              .map(coin => ({
                ...coin,
                ago: getDayDiff(coin.created_at ?? new Date().toISOString()) * -1,
                mine: statuses[coin.id]?.ob === user?.email,
                tags: filter(coin.tags, isDefined).map<string>(toUpper),
                price: coin.price ? +coin.price : 0,
                booked_at: statuses[coin.id]?.ba ?? null,
                booked_by: statuses[coin.id]?.bb ?? null,
                ordered_at: statuses[coin.id]?.oa ?? null,
                ordered_by: statuses[coin.id]?.ob ?? null,
              }))
              .map((coin) => {
                const tags = coin.tags;

                if (tags.includes('ANOUNCE') || tags.includes('SOON')) {
                  return { ...coin, tags: ['SOON'], price: 0, disabled: true, discountPrice: 0, soon: true };
                }

                if (coin.youtube) {
                  tags.unshift('VIDEO');
                }

                if (coin.booked_at) {
                  if (user && user.email === coin.booked_by) {
                    bookedCoins.push(coin);
                    tags.unshift('MY');
                  } else {
                    coin.disabled = true;
                    tags.unshift('BOOKED');
                  }
                }

                return { ...coin, tags, discountPrice: Math.round(coin.price * 90) / 100 };
              });
            const coinCountriesMap = mappedCoins.reduce((acc, coin) => ({ ...acc, [coin.country]: true }), {} as Record<string, boolean>);
            return [
              CoinsActions.setBookedCoins({ coins: bookedCoins }),
              CoinsActions.loadCoinsSuccess({ coins: mappedCoins }),
              CoinsActions.setCoinCountries({ countries: coinCountriesMap }),
            ];
          }),
          catchError((error) => {
            console.error('Error fetching coins:', error);
            return of(CoinsActions.loadCoinsFailure({ error }));
          })
        )
      }
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
