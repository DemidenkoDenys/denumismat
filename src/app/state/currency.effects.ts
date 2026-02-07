import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CurrencyActions from './currency.actions';

@Injectable()
export class CurrencyEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadCurrencyRates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurrencyActions.loadCurrencyRates),
      switchMap(() =>
        this.http.get<any>('https://api.exchangerate-api.com/v4/latest/USD').pipe(
          map((response) => {
            const rates = { USD: 1, ...response.rates };
            return CurrencyActions.loadCurrencyRatesSuccess({ rates });
          }),
          catchError((error) => {
            console.error('Error fetching currency rates:', error);
            return of(CurrencyActions.loadCurrencyRatesFailure({ error }));
          })
        )
      )
    )
  );

  loadCurrenciesInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurrencyActions.loadCurrenciesInfo),
      switchMap(() =>
        this.http.get<any>('/assets/currencies.json').pipe(
          map((info) => CurrencyActions.loadCurrenciesInfoSuccess({ info })),
          catchError((error) => {
            console.error('Error fetching currencies info:', error);
            return of(CurrencyActions.loadCurrenciesInfoFailure({ error }));
          })
        )
      )
    )
  );
}
