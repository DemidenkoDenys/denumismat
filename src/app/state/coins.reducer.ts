import { createReducer, on } from '@ngrx/store';
import * as CoinsActions from './coins.actions';
import { Coin } from '../components/coins/coin-card';

export interface CoinsState {
  coins: Coin[] | null;
  loading: boolean;
  error: any | null;
}

export const initialState: CoinsState = {
  coins: null,
  loading: false,
  error: null
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
  }))
);
