import { createReducer, on } from '@ngrx/store';
import * as CurrencyActions from './currency.actions';

export interface CurrencyState {
  rates: any | null;
  loading: boolean;
  error: any | null;
  selected: string | null;
  info: any | null;
  order: Record<string, number>;
}

export const initialState: CurrencyState = {
  rates: null,
  loading: false,
  error: null,
  selected: null,
  info: null,
  order: {
    USD: 0,
    EUR: 1,
    HUF: 2,
    UAH: 3,
    PLN: 6,
    CZK: 7,
    ROU: 8,
    RSD: 9,
    TRY: 10,
    GBP: 11,
    EGP: 12,
    CNY: 13
  }
};

export const currencyReducer = createReducer(
  initialState,
  on(CurrencyActions.loadCurrencyRates, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CurrencyActions.loadCurrencyRatesSuccess, (state, { rates }) => ({
    ...state,
    rates,
    loading: false,
    error: null
  })),
  on(CurrencyActions.loadCurrencyRatesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CurrencyActions.setSelectedCurrency, (state, { currencyKey }) => ({
    ...state,
    selected: currencyKey
  })),
  on(CurrencyActions.loadCurrenciesInfoSuccess, (state, { info }) => ({
    ...state,
    info
  })),
  on(CurrencyActions.loadCurrenciesInfoFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
