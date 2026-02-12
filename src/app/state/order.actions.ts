import { createAction, props } from '@ngrx/store';
import { Order } from '../models/order.model';

export const submitOrder = createAction(
  '[Order] Submit Order',
  props<{ order: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'> }>()
);

export const submitOrderSuccess = createAction(
  '[Order] Submit Order Success',
  props<{ order: Order }>()
);

export const submitOrderFailure = createAction(
  '[Order] Submit Order Failure',
  props<{ error: any }>()
);

export const loadOrders = createAction(
  '[Order] Load Orders'
);

export const loadOrdersSuccess = createAction(
  '[Order] Load Orders Success',
  props<{ orders: Order[] }>()
);

export const loadOrdersFailure = createAction(
  '[Order] Load Orders Failure',
  props<{ error: any }>()
);

export const updateOrderStatus = createAction(
  '[Order] Update Order Status',
  props<{ orderId: string; status: Order['status'] }>()
);

export const updateOrderStatusSuccess = createAction(
  '[Order] Update Order Status Success',
  props<{ order: Order }>()
);

export const updateOrderStatusFailure = createAction(
  '[Order] Update Order Status Failure',
  props<{ error: any }>()
);
