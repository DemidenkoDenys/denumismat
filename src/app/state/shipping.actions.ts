import { createAction, props } from '@ngrx/store';

export const loadShippingMethods = createAction('[Shipping] Load Methods');

export const loadShippingMethodsSuccess = createAction(
  '[Shipping] Load Methods Success',
  props<{ methods: any }>()
);

export const loadShippingMethodsFailure = createAction(
  '[Shipping] Load Methods Failure',
  props<{ error: any }>()
);
