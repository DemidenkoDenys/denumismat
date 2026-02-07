export interface CountryInfo {
  code: string;
  name: string;
  original: string;
  rate: number;
  must?: boolean;
  currency: string;
}

export interface CountryCurrency {
  name: string;
  code: string;
  symbol: string;
  short: string;
  start: boolean;
}

export type CountriesMap = Record<string, CountryInfo>;
