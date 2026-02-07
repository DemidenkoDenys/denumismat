import { createReducer, on } from '@ngrx/store';
import * as CurrencyActions from './currency.actions';

export interface CurrencyState {
  rates: any | null;
  loading: boolean;
  error: any | null;
  selected: string | null;
  info: any | null;
}

export const initialState: CurrencyState = {
  rates: null,
  loading: false,
  error: null,
  selected: null,
  info: null
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
