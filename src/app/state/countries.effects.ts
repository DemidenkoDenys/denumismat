import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CountriesActions from './countries.actions';
import { CountriesMap } from './countries.models';

@Injectable()
export class CountriesEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  loadCountries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CountriesActions.loadCountries),
      switchMap(() =>
        this.http.get<CountriesMap>('/assets/countries.json').pipe(
          map((countries) => CountriesActions.loadCountriesSuccess({ countries })),
          catchError((error) => of(CountriesActions.loadCountriesFailure({ error })))
        )
      )
    )
  );
}
