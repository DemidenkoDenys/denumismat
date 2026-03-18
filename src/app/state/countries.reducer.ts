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
    UKR: 1,
    HUN: 2,
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

    ALB: 101,
    ARG: 102,
    ARM: 103,
    AZE: 104,
    BEL: 105,
    CHE: 106,
    MDA: 107,
    EST: 108,
    DNK: 109,
    GEO: 110,
    NLD: 111,
    MLT: 112,
    AND: 113,
    NOR: 114,
    FIN: 115,
    BGR: 116,
    SAU: 117,
    SWE: 118,
    CYP: 119,
    ARE: 120,
    HRV: 121,
    ISL: 122,
    MYS: 123,
    SGP: 124,
    NZD: 125,
    KGZ: 126,
    GRC: 127,
    LUX: 128,
    TUR: 129,
    KAZ: 130,
    MKD: 131,
    SYR: 132,
    LIE: 133,
    UZB: 134,
    TJK: 135,
    TKM: 136,
    BRA: 137,
    COL: 138,
    MEX: 139,
    VNM: 140,
    EGY: 141,
    IDN: 142,
    ISR: 143,
    JPN: 144,
    HKG: 145,
    THA: 146,
    IND: 147,
    KOR: 148,
    CHN: 149,
    BLR: 150,
    RUS: 151,
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
