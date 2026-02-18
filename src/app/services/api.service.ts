import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.selectors';
import { EMPTY, switchMap, take } from 'rxjs';
import { Coin } from '../components/coins/coin-card';
import { PricePipe } from '../pipes/price.pipe';

@Injectable({ providedIn: 'root', })
export class ApiService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private price = inject(PricePipe);

  sendOrder(coins: Coin[], email: string, shipping: string, message?: string) {
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const text = `
${email} made an order:\n
${coins.map(coin => `${coin.country} -  ${coin.deno} - ${coin.year} - ${this.price.transform(coin.price)} (${this.price.transform(coin.discountPrice)})`).join('\n')}

Shipping method: ${shipping}

Message: ${message}
`;
          return this.http.post(`${environment.apiUrl}/send`, { text, subject: 'order', email: user.email });
        }
        return EMPTY;
      })
    );
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
${coin.deno} - ${coin.year}
${message}`;
          return this.http.post(`${environment.apiUrl}/send`, { text, email: user.email, telegramOnly: true });
        }
        return EMPTY;
      })
    );
  }
}
