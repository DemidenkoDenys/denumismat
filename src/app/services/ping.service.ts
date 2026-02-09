import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { fromEvent, timer, EMPTY } from 'rxjs';
import { switchMap, startWith, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PingService {

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
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
                    // Start immediately (0) and repeat every 2 minutes (120000ms)
                    return timer(0, 120000).pipe(
                        switchMap(() => this.http.get('http://localhost:3000/ping').pipe(
                            // Catch error to prevent infinite stream termination
                            catchError(err => {
                                console.error('Ping request failed', err);
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
