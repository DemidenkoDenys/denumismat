import { createReducer, on } from '@ngrx/store';
import * as OrderActions from './order.actions';
import { Order } from '../models/order.model';

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: any | null;
}

export const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null
};

export const orderReducer = createReducer(
  initialState,
  on(OrderActions.submitOrder, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrderActions.submitOrderSuccess, (state, { order }) => ({
    ...state,
    orders: [...state.orders, order],
    currentOrder: order,
    loading: false,
    error: null
  })),
  on(OrderActions.submitOrderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrderActions.loadOrders, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrderActions.loadOrdersSuccess, (state, { orders }) => ({
    ...state,
    orders,
    loading: false,
    error: null
  })),
  on(OrderActions.loadOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(OrderActions.updateOrderStatus, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(OrderActions.updateOrderStatusSuccess, (state, { order }) => ({
    ...state,
    orders: state.orders.map(o => o.id === order.id ? order : o),
    loading: false,
    error: null
  })),
  on(OrderActions.updateOrderStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
