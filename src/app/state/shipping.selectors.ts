import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShippingMethod, ShippingState } from './shipping.reducer';
import { filter, forEach, orderBy, sortBy } from 'lodash-es';

export const selectShippingState = createFeatureSelector<ShippingState>('shipping');

export const selectDomesticShippingMethods = createSelector(
  selectShippingState,
  (state) => sortBy(filter(state?.methods, 'domestic'), m => m.price ? m.price : 1000000)
);

export const selectInternationalShippingMethods = createSelector(
  selectShippingState,
  (state) => sortBy(filter(state?.methods, (method) => !method.domestic), m => m.price ? m.price : 1000000)
);

export const selectShippingMethods = createSelector(
  selectShippingState,
  (state) => {
    let personal, custom;

    const domestic: ShippingMethod[] = [];
    const international: ShippingMethod[] = [];

    forEach(state?.methods, (method, id) => {
      if (method.id === 'personal') {
        personal = method;
      } else if (method.id === 'custom') {
        custom = method;
      } else if (method.domestic) {
        domestic.push(method);
      } else {
        international.push(method);
      }
    });

    return [
      ...orderBy(domestic, 'price'),
      ...orderBy(international, 'price'),
      personal,
      custom
    ];
  }
);
