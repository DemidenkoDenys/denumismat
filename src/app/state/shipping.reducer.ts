import { createReducer, on } from '@ngrx/store';
import * as ShippingActions from './shipping.actions';
import { keyBy } from 'lodash-es';

export interface ShippingMethod { id: string; label: string; price: number, domestic: boolean };

export interface ShippingState {
  methods: Record<string, ShippingMethod>;
}

export const initialShippingState: ShippingState = {
  methods: {}
};

export const shippingReducer = createReducer(
  initialShippingState,
  on(ShippingActions.loadShippingMethodsSuccess, (state, { methods }) => ({ ...state, methods: keyBy(methods, 'id') })),
  on(ShippingActions.loadShippingMethodsFailure, state => ({ ...state, methods: {} }))
);
