import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ServerState } from './server.reducer';

export const selectServerState = createFeatureSelector<ServerState>('server');
export const selectServerIsAvailable = createSelector(selectServerState, (state) => state.isAvailable);
