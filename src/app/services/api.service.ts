import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.selectors';
import { EMPTY, switchMap, take } from 'rxjs';
import { Coin } from '../models/order.model';

@Injectable({ providedIn: 'root', })
export class ApiService {
  private http = inject(HttpClient);
  private store = inject(Store);

  sendOrder(coinIds: string[], email: string) {
    return this.http.post(`${environment.apiUrl}/sendOrder`, { coinIds, email });
  }

  sendMessage(message: string) {
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const text = `
${user.email}
${message}`;
          return this.http.post(`${environment.apiUrl}/send`, { text, email: user.email, telegramOnly: true });
        }
        return EMPTY;
      })
    );
  }

  sendCoinQuestion(coin: Coin, message: string) {
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const text = `
${user.email}
${coin.title}
${message}`;
          return this.http.post(`${environment.apiUrl}/send`, { text, email: user.email, telegramOnly: true });
        }
        return EMPTY;
      })
    );
  }
}
