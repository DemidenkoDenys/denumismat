import { createReducer, on } from '@ngrx/store';
import * as ServerActions from './server.actions';

export interface ServerState {
  isAvailable: boolean;
}

export const initialServerState: ServerState = {
  isAvailable: false
};

export const serverReducer = createReducer(
  initialServerState,
  on(ServerActions.setServerAvailability, (state, { isAvailable }) => ({ ...state, isAvailable }))
);
