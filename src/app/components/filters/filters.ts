import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface Filters {
  country: string | null;
  priceRange: [number, number];
  tags: string[];
  selectedOnly?: boolean;
}

@Component({
  selector: 'app-filters',
  template: `
    <aside class="filters" [attr.aria-label]="'filters.tags' | translate">
      <div class="filters__inner">
        <div class="filters__group filters__group--country">
          <input
            id="country"
            type="text"
            class="filters__input"
            [value]="country() ?? ''"
            (input)="onCountryInput($event)"
            [placeholder]="'filters.countryPlaceholder' | translate"
            [attr.aria-label]="'filters.countryPlaceholder' | translate"
          />
        </div>

        <div class="filters__group filters__group--range">
          <div class="filters__range-values">
            <span class="filters__value">{{ formattedMinPrice() }} - {{ formattedMaxPrice() }}</span>
          </div>
          <div class="filters__range-slider">
            <div class="filters__range-track"></div>
            <div
              class="filters__range-fill"
              [style.left.%]="rangeLeftPct()"
              [style.width.%]="rangeWidthPct()">
            </div>
            <input
              type="range"
              [min]="priceMinBound()"
              [max]="priceMaxBound()"
              step="0.1"
              [value]="priceMin()"
              (input)="onPriceMinInput($event)"
              (pointerdown)="bringMinToFront()"
              class="filters__range-input filters__range-input--min"
              [attr.aria-label]="'filters.priceMin' | translate"
              [style.z-index]="minZ()"
            />
            <input
              type="range"
              [min]="priceMinBound()"
              [max]="priceMaxBound()"
              step="0.1"
              [value]="priceMax()"
              (input)="onPriceMaxInput($event)"
              (pointerdown)="bringMaxToFront()"
              class="filters__range-input filters__range-input--max"
              [attr.aria-label]="'filters.priceMax' | translate"
              [style.z-index]="maxZ()"
            />
          </div>
        </div>

        <div class="filters__group filters__group--tags">
          <div class="filters__tags">
            <button
              type="button"
              class="filters__tag filters__tag--unc"
              [class.active]="tags().includes('UNC')"
              (click)="toggleTag('UNC')">{{ 'filters.tag.UNC' | translate }}</button>
            <button
              type="button"
              class="filters__tag filters__tag--rare"
              [class.active]="tags().includes('Rare')"
              (click)="toggleTag('Rare')">{{ 'filters.tag.Rare' | translate }}</button>
            <button
              type="button"
              class="filters__tag filters__tag--sale"
              [class.active]="tags().includes('Sale')"
              (click)="toggleTag('Sale')">{{ 'filters.tag.Sale' | translate }}</button>
            @if (selectedCount() > 0) {
              <button
                type="button"
                class="filters__tag filters__tag--selected"
                [class.active]="showSelectedOnly()"
                (click)="toggleSelectedOnly()">
                <span class="filters__tag-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" role="img" aria-hidden="true">
                    <path d="M3.5 8.5l3 3 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                {{ 'filters.tag.Selected' | translate }}
              </button>
            }
          </div>
        </div>

      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class FiltersComponent {
  country = input<string | null>(null);
  priceRange = input<[number, number]>([0, 10000]);
  priceBounds = input<[number, number]>([0, 10000]);
  tagsInput = input<string[]>([]);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });

  selectedCount = input<number>(0);

  filterChange = output<Filters>();

  // local signals for interactive control
  countrySignal = signal<string | null>(this.country());
  priceMin = signal<number>(this.priceRange()[0]);

  formattedMinPrice = computed(() => {
    const price = this.priceMin().toFixed(2);
    const format = this.currencyFormat();
    const currency = format.short;
    // Add thousands separator (space)
    const [intPart, decPart] = price.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedPrice = `${formattedInt}.${decPart}`;
    return format.start ? `${currency} ${formattedPrice}` : `${formattedPrice} ${currency}`;
  });

  formattedMaxPrice = computed(() => {
    const price = this.priceMax().toFixed(2);
    const format = this.currencyFormat();
    const currency = format.short;
    // Add thousands separator (space)
    const [intPart, decPart] = price.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedPrice = `${formattedInt}.${decPart}`;
    return format.start ? `${currency} ${formattedPrice}` : `${formattedPrice} ${currency}`;
  });
  priceMax = signal<number>(this.priceRange()[1]);
  tags = signal<string[]>(this.tagsInput());
  showSelectedOnly = signal<boolean>(false);
  minOnTop = signal<boolean>(false);
  priceMinBound = computed(() => this.priceBounds()[0]);
  priceMaxBound = computed(() => this.priceBounds()[1]);
  rangeSpan = computed(() => Math.max(0.01, this.priceMaxBound() - this.priceMinBound()));
  rangeLeftPct = computed(() => ((this.priceMin() - this.priceMinBound()) / this.rangeSpan()) * 100);
  rangeWidthPct = computed(() => ((this.priceMax() - this.priceMin()) / this.rangeSpan()) * 100);

  constructor() {
    effect(() => {
      const [min, max] = this.priceRange();
      this.priceMin.set(min);
      this.priceMax.set(max);
    });

    effect(() => {
      const minBound = this.priceMinBound();
      const maxBound = this.priceMaxBound();
      const nextMin = Math.max(minBound, Math.min(this.priceMin(), maxBound));
      const nextMax = Math.max(minBound, Math.min(this.priceMax(), maxBound));
      if (nextMin !== this.priceMin()) this.priceMin.set(nextMin);
      if (nextMax !== this.priceMax()) this.priceMax.set(nextMax);
      if (this.priceMin() > this.priceMax()) {
        this.priceMin.set(minBound);
        this.priceMax.set(maxBound);
      }
    });
  }

  private emit() {
    this.filterChange.emit({
      country: this.countrySignal(),
      priceRange: [this.priceMin(), this.priceMax()],
      tags: this.tags(),
      selectedOnly: this.showSelectedOnly(),
    });
  }

  minZ() {
    return this.minOnTop() ? 5 : 3;
  }

  maxZ() {
    return this.minOnTop() ? 3 : 5;
  }

  bringMinToFront() {
    this.minOnTop.set(true);
  }

  bringMaxToFront() {
    this.minOnTop.set(false);
  }

  onCountryInput(event: Event) {
    const v = (event.target as HTMLInputElement).value.trim();
    this.countrySignal.set(v === '' ? null : v);
    this.emit();
  }

  onPriceMinInput(event: Event) {
    const v = Number((event.target as HTMLInputElement).value);
    if (v <= this.priceMax()) {
      this.priceMin.set(v);
    }
    this.emit();
  }

  onPriceMaxInput(event: Event) {
    const v = Number((event.target as HTMLInputElement).value);
    if (v >= this.priceMin()) {
      this.priceMax.set(v);
    }
    this.emit();
  }

  toggleTag(tag: string) {
    const set = new Set(this.tags());
    if (set.has(tag)) {
      set.delete(tag);
    } else {
      set.add(tag);
    }
    this.tags.set(Array.from(set));
    this.emit();
  }

  toggleSelectedOnly() {
    this.showSelectedOnly.update(v => !v);
    this.emit();
  }
}
