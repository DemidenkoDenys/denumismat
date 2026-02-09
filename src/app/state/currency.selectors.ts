import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurrencyState } from './currency.reducer';
import { selectCountries } from './countries.selectors';

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

export const selectConversionRate = createSelector(
  selectCurrencyRates,
  selectSelectedCurrency,
  selectCountries,
  (rates, currencyKey, countriesMap) => {
    if (!rates || !currencyKey || !countriesMap) return 1;

    let currencyCode: string;
    if (currencyKey === 'EUR') {
      currencyCode = 'EUR';
    } else {
      const country = countriesMap[currencyKey];
      currencyCode = country?.currency || 'USD';
    }

    return rates[currencyCode] || 1;
  }
);

export const selectCurrencyFormat = createSelector(
  selectSelectedCurrency,
  selectCountries,
  selectCurrenciesInfo,
  (currencyKey, countriesMap, currInfo) => {
    if (!currencyKey || !countriesMap || !currInfo) {
      return { symbol: '$', short: '$', start: true };
    }

    let currencyCode: string;
    if (currencyKey === 'EUR') {
      currencyCode = 'EUR';
    } else {
      const country = countriesMap[currencyKey];
      currencyCode = country?.currency || 'USD';
    }

    const info = currInfo[currencyCode];
    return {
      symbol: info?.symbol || '$',
      short: info?.short || '$',
      start: info?.start !== false
    };
  }
);
