import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.reducer';

export const selectOrderState = createFeatureSelector<OrderState>('order');

export const selectOrders = createSelector(
  selectOrderState,
  (state) => state.orders
);

export const selectCurrentOrder = createSelector(
  selectOrderState,
  (state) => state.currentOrder
);

export const selectOrderLoading = createSelector(
  selectOrderState,
  (state) => state.loading
);

export const selectOrderError = createSelector(
  selectOrderState,
  (state) => state.error
);

export const selectOrderById = (orderId: string) => createSelector(
  selectOrders,
  (orders) => orders.find(order => order.id === orderId)
);

export const selectOrdersByStatus = (status: string) => createSelector(
  selectOrders,
  (orders) => orders.filter(order => order.status === status)
);
