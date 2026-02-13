import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { ALPHA3_TO_ALPHA2, LANGUAGE_CODES } from './app/config/country-codes';

// factory for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

bootstrapApplication(App, {
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient] }
      })
    )
    ,
    // ensure English is the default language at startup
    {
      provide: APP_INITIALIZER,
      useFactory: (translate: TranslateService) => {
        return () => {
          translate.addLangs(Object.values(ALPHA3_TO_ALPHA2));
          translate.setDefaultLang('en');
          let use = 'en';
          try {
            const stored = localStorage.getItem('denumismat-lang');
            if (stored) use = stored;
            else {
              const browser = translate.getBrowserLang();
              if (browser && LANGUAGE_CODES.includes(browser)) use = browser;
            }
          } catch {
            // ignore localStorage errors
          }
          translate.use(use as any);
          return Promise.resolve();
        };
      },
      deps: [TranslateService],
      multi: true,
    }
  ]
}).catch((err) => console.error(err));
