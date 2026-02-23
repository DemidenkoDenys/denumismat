import { Pipe, PipeTransform, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectConversionRate, selectCurrencyFormat, selectHufRate } from '../state/currency.selectors';

@Injectable({ providedIn: 'root' })
@Pipe({
  pure: false,
  name: 'price',
  standalone: true,
})
export class PricePipe implements PipeTransform {
  private store = inject(Store);

  private hufRate = toSignal(this.store.select(selectHufRate), { initialValue: 1 });
  private conversionRate = toSignal(this.store.select(selectConversionRate), { initialValue: 1 });
  private currencyFormat = toSignal(this.store.select(selectCurrencyFormat), {
    initialValue: { symbol: '$', short: '$', start: true, coins: true }
  });

  transform(value: number | null | undefined, withCurrency = true): string {
    if (value === null || value === undefined) return '';

    const rate = this.conversionRate();
    const effectiveFormat = this.currencyFormat();
    const convertedPrice = rate / this.hufRate() * value;

    // determine decimal precision: if coins are disabled, drop decimals entirely
    const decimals = effectiveFormat.coins === false ? 0 : 2;
    const formatted = convertedPrice.toFixed(decimals);
    const currency = effectiveFormat.short;

    // Add thousands separator (space)
    let displayPrice: string;
    if (decimals === 0) {
      const intPart = formatted.split('.')[0];
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      displayPrice = formattedInt;
    } else {
      const [intPart, decPart] = formatted.split('.');
      const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      displayPrice = `${formattedInt}.${decPart}`;
    }

    if (!withCurrency) {
      return displayPrice;
    }

    return effectiveFormat.start
      ? `${currency}${currency === '$' ? '' : ' '}${displayPrice}`
      : `${displayPrice} ${currency}`;
  }
}
