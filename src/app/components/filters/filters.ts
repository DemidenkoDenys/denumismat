import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface Filters {
  country: string | null;
  priceRange: [number, number];
  tags: string[];
}

@Component({
  selector: 'app-filters',
  template: `
    <aside class="filters" [attr.aria-label]="'filters.tags' | translate">
      <div class="filters__inner">
        <div class="filters__group">
          <label for="country" class="filters__label">{{ 'filters.countryPlaceholder' | translate }}</label>
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

        <div class="filters__group">
          <label class="filters__label">{{ 'filters.priceRange' | translate }}</label>
          <div class="filters__range">
            <input
              type="range"
              min="0"
              max="10000"
              step="1"
              [value]="priceMin()"
              (input)="onPriceMinChange($event)"
                [attr.aria-label]="'filters.priceMin' | translate"
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="1"
              [value]="priceMax()"
              (input)="onPriceMaxChange($event)"
                [attr.aria-label]="'filters.priceMax' | translate"
            />
          </div>
          <div class="filters__range-values">
            <span class="filters__value">{{ priceMin() | number:'1.0-0' }}</span>
            <span class="filters__value">-</span>
            <span class="filters__value">{{ priceMax() | number:'1.0-0' }}</span>
          </div>
        </div>

        <div class="filters__group">
          <label class="filters__label">{{ 'filters.tags' | translate }}</label>
          <div class="filters__tags">
            <button
              type="button"
              class="filters__tag"
              [class.active]="tags().includes('UNC')"
              (click)="toggleTag('UNC')">{{ 'filters.tag.UNC' | translate }}</button>
            <button
              type="button"
              class="filters__tag"
              [class.active]="tags().includes('Rare')"
              (click)="toggleTag('Rare')">{{ 'filters.tag.Rare' | translate }}</button>
            <button
              type="button"
              class="filters__tag"
              [class.active]="tags().includes('Sale')"
              (click)="toggleTag('Sale')">{{ 'filters.tag.Sale' | translate }}</button>
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
  tagsInput = input<string[]>([]);

  filterChange = output<Filters>();

  // local signals for interactive control
  countrySignal = signal<string | null>(this.country());
  priceMin = signal<number>(this.priceRange()[0]);
  priceMax = signal<number>(this.priceRange()[1]);
  tags = signal<string[]>(this.tagsInput());

  private emit() {
    this.filterChange.emit({
      country: this.countrySignal(),
      priceRange: [this.priceMin(), this.priceMax()],
      tags: this.tags(),
    });
  }

  onCountryInput(event: Event) {
    const v = (event.target as HTMLInputElement).value.trim();
    this.countrySignal.set(v === '' ? null : v);
    this.emit();
  }

  onPriceMinChange(event: Event) {
    const v = Number((event.target as HTMLInputElement).value);
    if (v <= this.priceMax()) {
      this.priceMin.set(v);
    } else {
      this.priceMin.set(this.priceMax());
    }
    this.emit();
  }

  onPriceMaxChange(event: Event) {
    const v = Number((event.target as HTMLInputElement).value);
    if (v >= this.priceMin()) {
      this.priceMax.set(v);
    } else {
      this.priceMax.set(this.priceMin());
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
}
