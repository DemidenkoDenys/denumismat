import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.selectors';
import { EMPTY, switchMap, take } from 'rxjs';
import { Coin } from '../components/coins/coin-card';
import { sanitizeText } from '../utils/message.utils';
import { PricePipe } from '../pipes/price.pipe';
import { decrypt } from '../utils/cr.utils';

@Injectable({ providedIn: 'root', })
export class NotificationService {
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

Message: ${sanitizeText(message ?? '')}
`;
          return this.http.post(`${environment.apiUrl}/send`, { text, subject: 'order', email: user.email });
        }
        return EMPTY;
      })
    );
  }

  sendBookCoins(coins: Coin[], email: string) {
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        if (user) {
          const text = `
${email} booked coins:\n
${coins.map(coin => `${coin.country} -  ${coin.deno} - ${coin.year} - ${this.price.transform(coin.price)} (${this.price.transform(coin.discountPrice)})`).join('\n')}
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
Message from: ${user.email}
${sanitizeText(message)}`;
          return this.http.post(`${environment.apiUrl}/send`, { subject: 'Message', text, email: user.email, telegramOnly: true });
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
User ask: ${user.email}
About coin: ${coin.id} - (${coin.deno} - ${coin.year})
${sanitizeText(message)}`;
          return this.http.post(`${environment.apiUrl}/send`, { subject: 'Coin Question', text, email: user.email, telegramOnly: true });
        }
        return EMPTY;
      })
    );
  }

  sendVerifyCode(email: string, code: string) {
    const text = `
User: ${email}
Verification code: ${decrypt(code)}`;
    return this.http.post(`${environment.apiUrl}/send`, { email, text, subject: 'verification code' });
  }
}
