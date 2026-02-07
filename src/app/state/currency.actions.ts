import { createAction, props } from '@ngrx/store';

export const loadCurrencyRates = createAction(
  '[Currency] Load Rates'
);

export const loadCurrencyRatesSuccess = createAction(
  '[Currency] Load Rates Success',
  props<{ rates: any }>()
);

export const loadCurrencyRatesFailure = createAction(
  '[Currency] Load Rates Failure',
  props<{ error: any }>()
);

export const setSelectedCurrency = createAction(
  '[Currency] Set Selected',
  props<{ currencyKey: string }>()
);

export const loadCurrenciesInfo = createAction(
  '[Currency] Load Currencies Info'
);

export const loadCurrenciesInfoSuccess = createAction(
  '[Currency] Load Currencies Info Success',
  props<{ info: any }>()
);

export const loadCurrenciesInfoFailure = createAction(
  '[Currency] Load Currencies Info Failure',
  props<{ error: any }>()
);
