import { createReducer, on } from '@ngrx/store';
import * as CountriesActions from './countries.actions';
import { CountriesMap } from './countries.models';

export interface CountriesState {
  countries: CountriesMap | null;
  extincts: CountriesMap | null;
  loading: boolean;
  error: any | null;
  selected: string | null;
  order: Record<string, number>;
}

export const initialState: CountriesState = {
  countries: null,
  extincts: null,
  loading: false,
  error: null,
  selected: null,
  order: {
    USA: 0,
    HUN: 1,
    UKR: 2,
    DEU: 3,
    FRA: 4,
    SVK: 5,
    POL: 6,
    ROU: 7,
    CZE: 9,
    SRB: 10,
    ITA: 11,
    ESP: 12,
    LVA: 13,
    LTU: 14,
    TUR: 15,
    CHN: 16,
    EGY: 17,
    BRA: 18
  }
};

export const countriesReducer = createReducer(
  initialState,
  on(CountriesActions.loadCountries, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CountriesActions.loadCountriesSuccess, (state, { countries }) => ({
    ...state,
    countries,
    loading: false,
    error: null
  })),
  on(CountriesActions.loadCountriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CountriesActions.setSelectedLanguage, (state, { countryKey }) => ({
    ...state,
    selected: countryKey
  })),
  on(CountriesActions.loadExtinctCountries, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CountriesActions.loadExtinctCountriesSuccess, (state, { extincts }) => ({
    ...state,
    extincts,
    loading: false,
    error: null
  })),
  on(CountriesActions.loadExtinctCountriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
