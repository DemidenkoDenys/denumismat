import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CountriesState } from './countries.reducer';

export const selectCountriesState = createFeatureSelector<CountriesState>('countries');

export const selectCountries = createSelector(
  selectCountriesState,
  (state) => state.countries
);

export const selectCountriesOrder = createSelector(
  selectCountriesState,
  (state) => state.order
);

export const selectCountriesLoading = createSelector(
  selectCountriesState,
  (state) => state.loading
);

export const selectCountriesError = createSelector(
  selectCountriesState,
  (state) => state.error
);

export const selectSelectedLanguage = createSelector(
  selectCountriesState,
  (state) => state.selected
);

export const selectExtinctCountries = createSelector(
  selectCountriesState,
  (state) => state.extincts
);
