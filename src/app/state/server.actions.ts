import { createAction, props } from '@ngrx/store';

export const setServerAvailability = createAction(
  '[Server] Set Availability',
  props<{ isAvailable: boolean }>()
);
