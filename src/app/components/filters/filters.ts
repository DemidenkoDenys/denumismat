import { Component, ChangeDetectionStrategy, input, output, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CountryDropdownComponent } from '../country-dropdown/country-dropdown.component';
import { fromEvent } from 'rxjs';
import { map, pairwise, distinctUntilChanged } from 'rxjs/operators';

export interface Filters {
  tags: string[];
  country?: string | null;
  priceRange: [number, number];
  selectedOnly?: boolean;
}

@Component({
  selector: 'app-filters',
  template: `
    <aside class="filters" [class.scrolling-down]="scrollingDown()" [attr.aria-label]="'filters.tags' | translate">
      <div class="filters__inner">
        <div class="filters__group filters__group--country">
          <span class="filters__group--country-description">{{ selectedCountry() ? ('filters.coinsOf' | translate) : ('filters.country' | translate)}} </span>
          @if (selectedCountry()) {
            <span>{{ 'countries.' + selectedCountry()  | translate }}</span>
          } @else {
            <country-dropdown [value]="selectedCountry() || ''" (onCountryChanged)="onCountryChange($event)"></country-dropdown>
          }

          @if (selectedCountry()) {
            <button class="filters__group--country-reset" (click)="onCountryChange(null)">{{ 'filters.reset' | translate }}</button>
          }
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
              step="0.05"
              class="filters__range-input filters__range-input--min"
              [min]="priceMinBound()"
              [max]="priceMaxBound()"
              [value]="priceMin()"
              [style.z-index]="minZ()"
              [attr.aria-label]="'filters.priceMin' | translate"
              (pointerdown)="bringMinToFront()"
              (input)="onPriceMinInput($event)"
            />

            <input
              type="range"
              step="0.05"
              class="filters__range-input filters__range-input--max"
              [min]="priceMinBound()"
              [max]="priceMaxBound()"
              [value]="priceMax()"
              [style.z-index]="maxZ()"
              [attr.aria-label]="'filters.priceMax' | translate"
              (pointerdown)="bringMaxToFront()"
              (input)="onPriceMaxInput($event)"
            />
          </div>
        </div>

        <div class="filters__group filters__group--tags">
          <span class="filters__label" style="display: inline-block; margin-right: 0.5rem; align-self: center;">
            {{ 'filters.leaveOnly' | translate }}
          </span>

          <div class="filters__tags">
            @for (tag of availableTags(); track tag) {
              <button
                type="button"
                class="filters__tag"
                [class]="'filters__tag--' + tag.toLowerCase()"
                [class.active]="tags().includes(tag)"
                (click)="toggleTag(tag)">
                @if (tag.toLowerCase() === 'video') {
                  <span class="filters__tag-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="12" height="12" fill="white" stroke="currentColor" stroke-width="40">
                      <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
                    </svg>
                  </span>
                }
                {{ ('filters.tag.' + tag.toUpperCase()) | translate }}
              </button>
            }

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
  imports: [CommonModule, TranslateModule, CountryDropdownComponent],
})
export class FiltersComponent implements OnInit {
  priceRange = input<[number, number]>([0, 10000]);
  priceBounds = input<[number, number]>([0, 10000]);
  tagsInput = input<string[]>([]);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });
  conversionRate = input<number>(1);
  allCoins = input<any[]>([]);
  selectedCount = input<number>(0);

  availableTags = computed(() => {
    const coins = this.allCoins();
    if (!coins || coins.length === 0) return [];

    const tagSet = new Set<string>();
    coins.forEach(coin => {
      if (coin.tags && Array.isArray(coin.tags)) {
        coin.tags.forEach((tag: string) => tagSet.add(tag));
      }
    });

    return Array.from(tagSet).sort();
  });

  filterChange = output<Filters>();

  priceMin = signal<number>(this.priceRange()[0]);
  scrollingDown = signal(false);

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

  // Adjust price range to use discountPrice
  filteredCoins = computed(() => {
    const [min, max] = this.priceRange();
    return this.allCoins().filter(coin => coin.price >= min && coin.price <= max);
  });

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

  ngOnInit() {
    fromEvent(window, 'scroll').pipe(
      map(() => window.pageYOffset || document.documentElement.scrollTop),
      pairwise(),
      map(([prev, curr]) => curr > prev ? 'down' : 'up'),
      distinctUntilChanged()
    ).subscribe(direction => this.scrollingDown.set(direction === 'down'));
  }

  private emit() {
    this.filterChange.emit({
      tags: this.tags(),
      country: this.selectedCountry(),
      priceRange: [this.priceMin(), this.priceMax()],
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

  selectedCountry = signal<string | null>(null);
  onCountryChange(event: any) {
    this.selectedCountry.set(event);
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
