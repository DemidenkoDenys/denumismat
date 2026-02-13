import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoinsState } from './coins.reducer';

export const selectCoinsState = createFeatureSelector<CoinsState>('coins');

export const selectCoins = createSelector(
  selectCoinsState,
  (state) => state.coins
);

export const selectCoinsCountries = createSelector(
  selectCoinsState,
  (state) => state.countries
);

export const selectCoinsLoading = createSelector(
  selectCoinsState,
  (state) => state.loading
);

export const selectCoinsError = createSelector(
  selectCoinsState,
  (state) => state.error
);

export const selectSelectedCoins = createSelector(
  selectCoinsState,
  (state) => state.selected
);

export const selectSelectedCoinIds = createSelector(
  selectSelectedCoins,
  (selected) => Object.keys(selected)
);

export const selectSelectedCoinsArray = createSelector(
  selectSelectedCoins,
  (selected) => Object.values(selected)
);

export const selectSelectedCoinsCount = createSelector(
  selectSelectedCoins,
  (selected) => Object.keys(selected).length
);

export const selectIsCoinSelected = (coinId: string) => createSelector(
  selectSelectedCoins,
  (selected) => !!selected[coinId]
);

export const selectSelectedCoinsPrice = createSelector(
  selectSelectedCoinsArray,
  (selectedCoins) => selectedCoins.reduce((total, coin) => {
    return total + (coin.price || 0);
  }, 0)
);

export const selectSelectedCoinsDiscountPrice = createSelector(
  selectSelectedCoinsArray,
  (selectedCoins) => selectedCoins.reduce((total, coin) => {
    return total + (coin.discountPrice || 0);
  }, 0)
);

export const isCoinSelected = createSelector(
  selectCoins,
  (coins) => coins && coins.length > 0
);

// Additional selectors for filtering and querying coins
export const selectCoinsCount = createSelector(
  selectCoins,
  (coins) => coins?.length || 0
);

export const selectCoinById = (id: string) => createSelector(
  selectCoins,
  (coins) => coins?.find(coin => coin.id === id) || null
);

export const selectCoinsByCountry = (country: string) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.country === country) || []
);

export const selectCoinsByYear = (year: number) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.year === year) || []
);

export const selectCoinsByDeno = (deno: string) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.deno === deno) || []
);

export const selectCoinsWithDiscount = createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.discountPrice && coin.discountPrice < coin.price) || []
);

export const selectCoinsByTag = (tag: string) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.tags?.includes(tag)) || []
);

export const selectCoinsByPriceRange = (minPrice: number, maxPrice: number) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.price >= minPrice && coin.price <= maxPrice) || []
);

export const selectCoinsByCountryAndYear = (country: string, year: number) => createSelector(
  selectCoins,
  (coins) => coins?.filter(coin => coin.country === country && coin.year === year) || []
);

export const selectUniqueCountries = createSelector(
  selectCoins,
  (coins) => {
    if (!coins) return [];
    const countries = coins.map(coin => coin.country);
    return [...new Set(countries)].sort();
  }
);

export const selectUniqueYears = createSelector(
  selectCoins,
  (coins) => {
    if (!coins) return [];
    const years = coins.map(coin => coin.year);
    return [...new Set(years)].sort((a, b) => b - a); // Sort descending (newest first)
  }
);

export const selectUniqueDenominations = createSelector(
  selectCoins,
  (coins) => {
    if (!coins) return [];
    const denos = coins.map(coin => coin.deno);
    return [...new Set(denos)].sort();
  }
);

export const selectAllTags = createSelector(
  selectCoins,
  (coins) => {
    if (!coins) return [];
    const allTags = coins.flatMap(coin => coin.tags || []);
    return [...new Set(allTags)].sort();
  }
);
