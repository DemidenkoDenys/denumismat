import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import { selectUser } from '../state/auth/auth.selectors';
import { EMPTY, of, switchMap, take } from 'rxjs';
import { Coin } from '../components/coins/coin-card';
import { sanitizeText } from '../utils/message.utils';
import { PricePipe } from '../pipes/price.pipe';
import { decrypt } from '../utils/cr.utils';
import { TranslateService } from '@ngx-translate/core';
import { ShippingMethod } from '../state/shipping.reducer';
import { sumBy } from 'lodash';

@Injectable({ providedIn: 'root', })
export class NotificationService {
  private http = inject(HttpClient);
  private store = inject(Store);
  private price = inject(PricePipe);
  private translate = inject(TranslateService);

  sendOrder(coins: Coin[], shipping: ShippingMethod) {
    return this.store.select(selectUser).pipe(
      take(1),
      switchMap(user => {
        const shippingPrice = this.price.transform(shipping.price);

        if (user) {
          const text = `${this.translate.instant('orderMessage')}

${coins.map((coin, i) => `${i + 1}: ${this.translate.instant(`countries.${coin.country}`)} -  ${coin.deno} - ${coin.year} - ${this.price.transform(coin.discountPrice)}`).join('\n')}

${this.translate.instant('orderModal.shippingMethod')}: ${this.translate.instant(`shipping.${shipping.id}`)} - ${shippingPrice}

${`${this.translate.instant('orderModal.total')}: ${this.price.transform(sumBy(coins, 'discountPrice') + shipping.price)}`}
`;

return this.http.post(`${environment.apiUrl}/send`, { subject: 'order', email: user.email, text });
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
${this.translate.instant('bookingMessage')}:

${coins.map((coin, i) => `${i + 1}: ${this.translate.instant(`countries.${coin.country}`)} -  ${coin.deno} - ${coin.year} - ${this.price.transform(coin.discountPrice)}`).join('\n')}
`;
          return this.http.post(`${environment.apiUrl}/send`, { subject: 'booking', email: user.email, text });
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
    const subject = this.translate.instant('verifyCodeTitle');
    const message = this.translate.instant('verifyCodeMessage');
    const verifyCode = decrypt(code);
    const text = `
${message}: ${verifyCode}`;
    return this.http.post(`${environment.apiUrl}/send`, { subject, email, text, verifyCode });
  }
}
