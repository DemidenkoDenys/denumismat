import { createReducer, on } from '@ngrx/store';
import * as CoinsActions from './coins.actions';
import { Coin } from '../components/coins/coin-card';

export interface CoinsState {
  coins: Coin[] | null;
  selected: { [coinId: string]: Coin };
  loading: boolean;
  error: any | null;
  countries: Record<string, Coin>;
}

export const initialState: CoinsState = {
  coins: null,
  selected: {},
  loading: false,
  error: null,
  countries: {}
};

export const coinsReducer = createReducer(
  initialState,
  on(CoinsActions.loadCoins, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CoinsActions.loadCoinsSuccess, (state, { coins }) => ({
    ...state,
    coins,
    loading: false,
    error: null
  })),
  on(CoinsActions.loadCoinsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(CoinsActions.selectCoin, (state, { coin }) => ({
    ...state,
    selected: {
      ...state.selected,
      [coin.id]: coin
    }
  })),
  on(CoinsActions.deselectCoin, (state, { coinId }) => {
    const { [coinId]: removed, ...remaining } = state.selected;
    return {
      ...state,
      selected: remaining
    };
  }),
  on(CoinsActions.clearSelection, (state) => ({
    ...state,
    selected: {}
  })),
  on(CoinsActions.toggleCoinSelection, (state, { coin }) => {
    const isSelected = state.selected[coin.id];
    if (isSelected) {
      const { [coin.id]: removed, ...remaining } = state.selected;
      return {
        ...state,
        selected: remaining
      };
    } else {
      return {
        ...state,
        selected: {
          ...state.selected,
          [coin.id]: coin
        }
      };
    }
  }),
  on(CoinsActions.setCoinCountries, (state, { countries }) => ({
    ...state,
    countries
  }))
);
