import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShippingState } from './shipping.reducer';

export const selectShippingState = createFeatureSelector<ShippingState>('shipping');

export const selectShippingMethods = createSelector(
  selectShippingState,
  (state) => Object.values(state?.methods || {}) as { id: string; label: string; price?: number }[]
);
