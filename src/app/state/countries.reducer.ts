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

    ALB: 101,
    ARG: 102,
    ARM: 103,
    AZE: 104,
    CHE: 105,
    DNK: 106,
    GEO: 107,
    HKG: 108,
    IND: 109,
    IDN: 110,
    ISR: 111,
    JPN: 112,
    KAZ: 113,
    KOR: 114,
    MEX: 115,
    NOR: 116,
    SAU: 117,
    SWE: 118,
    ARE: 119,
    CHL: 120,
    COL: 121,
    HRV: 122,
    ISL: 123,
    MYS: 124,
    NGA: 125,
    NZD: 126,
    SGP: 127,
    THA: 128,
    UZB: 129,
    BGR: 130,
    CYP: 131,
    KGZ: 132,
    EST: 133,
    FIN: 134,
    GRC: 135,
    IRL: 136,
    IQA: 137,
    LUX: 138,
    MKD: 139,
    MLT: 140,
    SYR: 141,
    AND: 142,
    BLR: 143,
    IRN: 144,
    LIE: 145,
    MDA: 146,
    TJK: 147,
    TKM: 148,
    RUS: 149,
    NLD: 150,
    VNM: 151,
    BEL: 152,
    EGY: 154,
    BRA: 155,
    TUR: 156,
    CHN: 160,
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
