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

export const selectCoin = createAction(
  '[Coins] Select Coin',
  props<{ coin: Coin }>()
);

export const deselectCoin = createAction(
  '[Coins] Deselect Coin',
  props<{ coinId: string }>()
);

export const clearSelection = createAction(
  '[Coins] Clear Selection'
);

export const toggleCoinSelection = createAction(
  '[Coins] Toggle Coin Selection',
  props<{ coin: Coin }>()
);
