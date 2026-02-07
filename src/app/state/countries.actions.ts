import { createAction, props } from '@ngrx/store';
import { CountriesMap } from './countries.models';

export const loadCountries = createAction(
  '[Countries] Load Countries'
);

export const loadCountriesSuccess = createAction(
  '[Countries] Load Countries Success',
  props<{ countries: CountriesMap }>()
);

export const loadCountriesFailure = createAction(
  '[Countries] Load Countries Failure',
  props<{ error: any }>()
);

export const setSelectedLanguage = createAction(
  '[Countries] Set Selected Language',
  props<{ countryKey: string }>()
);
