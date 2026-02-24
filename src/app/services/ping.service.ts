import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { fromEvent, timer, EMPTY, of } from 'rxjs';
import { switchMap, startWith, map, catchError, expand } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import * as ServerActions from '../state/server.actions';
import { ToastService } from './toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PingService {
  activated = false;

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private store: Store,
    private toast: ToastService,
    private translate: TranslateService,
  ) {
    this.startPinging();
  }

  private startPinging() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const visibilityChange$ = fromEvent(this.document, 'visibilitychange');

      visibilityChange$.pipe(
        startWith(null),
        map(() => this.document.visibilityState),
        switchMap(visibilityState => {
          if (visibilityState === 'visible') {
            // when page is visible start a cycle: send one ping immediately,
            // then wait 2 minutes after a **successful** response before pinging again.
            const singlePing$ = () => this.http
              .get(`${environment.apiUrl}/ping`, { responseType: 'text' })
              .pipe(
                map((res: string) => res === 'Pong'),
                switchMap(isPong => {
                  if (isPong) {
                    this.zone.run(() => {
                      if (!this.activated) {
                        this.activated = true;
                        this.store.dispatch(
                          ServerActions.setServerAvailability({ isAvailable: true })
                        );
                      }
                    });
                    return of(true);
                  }
                  // not a pong, treat as failure so cycle stops
                  this.zone.run(() =>
                    this.store.dispatch(
                      ServerActions.setServerAvailability({ isAvailable: false })
                    )
                  );
                  return EMPTY;
                }),
                catchError(err => {
                  console.error('Ping request failed', err);
                  this.zone.run(() =>
                    this.store.dispatch(
                      ServerActions.setServerAvailability({ isAvailable: false })
                    )
                  );
                  return EMPTY;
                })
              );

            // recursive timer chain: ping, then after success wait 2 minutes and repeat
            // expand will resubscribe only when the previous cycle returned true
            // (meaning we got a Pong); if an error occurs or we return EMPTY the
            // whole chain completes and will restart only when visibility changes.
            return singlePing$().pipe(
              expand(ok => {
                if (!ok) {
                  // stop the cycle on failure
                  return EMPTY;
                }
                return timer(120000).pipe(switchMap(() => singlePing$()));
              })
            );
          } else {
            // page is hidden - cancel any existing cycle
            return EMPTY;
          }
        })
      ).subscribe();
    });
  }
}
