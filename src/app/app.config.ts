import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
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

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ currency: currencyReducer, countries: countriesReducer, coins: coinsReducer, auth: authReducer, order: orderReducer }),
    provideEffects([CurrencyEffects, CountriesEffects, AuthEffects, OrderEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false })
  ]
};
