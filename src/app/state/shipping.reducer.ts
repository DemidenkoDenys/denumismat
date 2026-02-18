import { createReducer, on } from '@ngrx/store';
import * as ShippingActions from './shipping.actions';
import { keyBy } from 'lodash-es';

export interface ShippingState {
  methods: Record<string, { id: string; label: string; price?: number }>;
}

export const initialShippingState: ShippingState = {
  methods: {}
};

export const shippingReducer = createReducer(
  initialShippingState,
  on(ShippingActions.loadShippingMethodsSuccess, (state, { methods }) => ({ ...state, methods: keyBy(methods, 'id') })),
  on(ShippingActions.loadShippingMethodsFailure, state => ({ ...state, methods: {} }))
);
