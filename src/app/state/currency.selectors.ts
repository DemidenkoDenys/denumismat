import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurrencyState } from './currency.reducer';

export const selectCurrencyState = createFeatureSelector<CurrencyState>('currency');

export const selectCurrencyRates = createSelector(
  selectCurrencyState,
  (state) => state.rates
);

export const selectCurrencyLoading = createSelector(
  selectCurrencyState,
  (state) => state.loading
);

export const selectCurrencyError = createSelector(
  selectCurrencyState,
  (state) => state.error
);

export const selectSelectedCurrency = createSelector(
  selectCurrencyState,
  (state) => state.selected
);

export const selectCurrenciesInfo = createSelector(
  selectCurrencyState,
  (state) => state.info
);
