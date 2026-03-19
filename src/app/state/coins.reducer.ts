import { createReducer, on } from '@ngrx/store';
import * as CoinsActions from './coins.actions';
import { Coin } from '../components/coins/coin-card';
import { omit } from 'lodash-es';

export interface CoinsState {
  coins: Coin[] | null;
  booked: Coin[];
  selected: { [coinId: string]: Coin };
  loading: boolean;
  error: any | null;
  countries: Record<string, boolean>;
  images: any;
}

export const initialState: CoinsState = {
  coins: null,
  booked: [],
  selected: {},
  loading: false,
  error: null,
  countries: {},
  images: null
};

export const MAX_SELECTED_COINS = 50;

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
  on(CoinsActions.selectCoin, (state, { coin }) => {
    const selectedCount = Object.keys(state.selected).length;
    if (selectedCount >= MAX_SELECTED_COINS) {
      // limit reached — ignore additional selects
      return state;
    }
    return {
      ...state,
      selected: {
        ...state.selected,
        [coin.id]: coin
      }
    };
  }),
  on(CoinsActions.deselectCoin, (state, { coinId }) => {
    return {
      ...state,
      selected: omit(state.selected, coinId)
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
      const selectedCount = Object.keys(state.selected).length;
      if (selectedCount >= MAX_SELECTED_COINS) {
        return state; // ignore
      }
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
  })),
  on(CoinsActions.setBookedCoins, (state, { coins }) => ({
    ...state,
    booked: coins
  })),
  on(CoinsActions.selectBookedCoinsByEmail, (state, { email }) => ({
    ...state,
    booked: email ? state.coins?.filter(coin => coin.booked_by === email) ?? [] : []
  })),
  on(CoinsActions.setCoinImages, (state, { images }) => ({
    ...state,
    images
  })),
);
