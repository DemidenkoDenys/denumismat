import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoinsState } from './coins.reducer';

export const selectCoinsState = createFeatureSelector<CoinsState>('coins');

export const selectCoins = createSelector(
  selectCoinsState,
  (state) => state.coins
);

export const selectCoinsLoading = createSelector(
  selectCoinsState,
  (state) => state.loading
);

export const selectCoinsError = createSelector(
  selectCoinsState,
  (state) => state.error
);
