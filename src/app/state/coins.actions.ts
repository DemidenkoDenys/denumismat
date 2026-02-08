import { createAction, props } from '@ngrx/store';
import { Coin } from '../components/coins/coin-card';

export const loadCoins = createAction(
  '[Coins] Load Coins'
);

export const loadCoinsSuccess = createAction(
  '[Coins] Load Coins Success',
  props<{ coins: Coin[] }>()
);

export const loadCoinsFailure = createAction(
  '[Coins] Load Coins Failure',
  props<{ error: any }>()
);
