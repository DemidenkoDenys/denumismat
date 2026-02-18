import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { fromEvent, timer, EMPTY } from 'rxjs';
import { switchMap, startWith, map, catchError } from 'rxjs/operators';
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
    // this.startPinging();
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
            return timer(0, 120000).pipe(
              switchMap(() => this.http.get(`${environment.apiUrl}/ping`, { responseType: 'text' }).pipe(
                map((res: string) => {
                  if (res === 'Pong') {
                    this.zone.run(() => {
                      if (this.activated) return;
                      this.activated = true;
                      this.store.dispatch(ServerActions.setServerAvailability({ isAvailable: true }));
                      this.toast.show(this.translate.instant('toast.nowYouCanSendMessagesAndBookCoins'), { type: 'success', duration: 5000 });
                    });
                  }
                  return res;
                }),
                catchError(err => {
                  console.error('Ping request failed', err);
                  this.zone.run(() => this.store.dispatch(ServerActions.setServerAvailability({ isAvailable: false })));
                  return EMPTY;
                })
              ))
            );
          } else {
            return EMPTY;
          }
        })
      ).subscribe();
    });
  }
}
