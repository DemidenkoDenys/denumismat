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
import { CoinsEffects } from './state/coins.effects';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ currency: currencyReducer, countries: countriesReducer, coins: coinsReducer }),
    provideEffects([CurrencyEffects, CountriesEffects, CoinsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false })
  ]
};
