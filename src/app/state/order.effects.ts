import { Injectable, inject } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class OrderEffects {
  private actions$ = inject(Actions);
}
