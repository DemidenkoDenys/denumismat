import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { currencyReducer } from './state/currency.reducer';
import { CurrencyEffects } from './state/currency.effects';
import { countriesReducer } from './state/countries.reducer';
import { CountriesEffects } from './state/countries.effects';
import { coinsReducer } from './state/coins.reducer';
import { authReducer } from './state/auth/auth.reducer';
import { AuthEffects } from './state/auth/auth.effects';
import { orderReducer } from './state/order.reducer';
import { OrderEffects } from './state/order.effects';
import { shippingReducer } from './state/shipping.reducer';
import { ShippingEffects } from './state/shipping.effects';
import { serverReducer } from './state/server.reducer';
import { environment } from '../environments/environment';

import { routes } from './app.routes';

const reducers = {
  auth: authReducer,
  coins: coinsReducer,
  order: orderReducer,
  server: serverReducer,
  currency: currencyReducer,
  shipping: shippingReducer,
  countries: countriesReducer,
};

const provideReduxDevtools = !environment.production
  ? [provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore(reducers),
    provideEffects([CurrencyEffects, CountriesEffects, AuthEffects, OrderEffects, ShippingEffects]),
    ...provideReduxDevtools,
  ],
};
