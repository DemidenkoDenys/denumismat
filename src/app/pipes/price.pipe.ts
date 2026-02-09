import { Pipe, PipeTransform, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { selectConversionRate, selectCurrencyFormat } from '../state/currency.selectors';

@Pipe({
  name: 'price',
  standalone: true,
  pure: false
})
export class PricePipe implements PipeTransform {
  private store = inject(Store);

  private conversionRate = toSignal(this.store.select(selectConversionRate), { initialValue: 1 });
  private currencyFormat = toSignal(this.store.select(selectCurrencyFormat), {
    initialValue: { symbol: '$', short: '$', start: true }
  });

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';

    const rate = this.conversionRate();
    const effectiveFormat = this.currencyFormat();

    const convertedPrice = value * rate;
    const formatted = convertedPrice.toFixed(2);

    const currency = effectiveFormat.short;

    // Add thousands separator (space)
    const [intPart, decPart] = formatted.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const displayPrice = `${formattedInt}.${decPart}`;

    return effectiveFormat.start ? `${currency} ${displayPrice}` : `${displayPrice} ${currency}`;
  }
}
