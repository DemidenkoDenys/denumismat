import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface Coin {
  id: string;
  name: string;
  year: number;
  price: number;
  weight: number;
  description: string;
  imageUrl: string;
  category: string[];
  country: string;
  isBooked: boolean;
}

/**
 * CoinCardComponent
 *
 * Displays a coin card with:
 * - Selectable entire card area
 * - Coin image thumbnail
 * - Coin details (name, year, price)
 * - Expandable details section
 * - Selection checkbox
 *
 * The entire card is clickable to toggle selection.
 */
@Component({
  selector: 'app-coin-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="coin-card"
      [class.selected]="selected()"
      (click)="toggleSelect()"
      role="button"
      tabindex="0"
      (keydown.space)="toggleSelect()"
      (keydown.enter)="toggleSelect()"
      [attr.aria-pressed]="selected()">

      <label class="coin-card__select" (click)="$event.stopPropagation()">
        <input
          type="checkbox"
          [checked]="selected()"
          (change)="$event.stopPropagation(); toggleSelect()"
          [attr.aria-label]="'coin.select' | translate" />
      </label>

      <div class="coin-card__media">
        <img [src]="coin().imageUrl" alt="{{ coin().name }} thumbnail" class="coin-card__image" />
        <div class="coin-card__tags">
          @for (tag of coin().category; track tag) {
            <span
              class="coin-card__tag"
              [class.coin-card__tag--unc]="tag === 'UNC'"
              [class.coin-card__tag--rare]="tag === 'Rare'"
              [class.coin-card__tag--sale]="tag === 'Sale'">
              {{ ('filters.tag.' + tag) | translate }}
            </span>
          }
        </div>
        <span class="coin-card__price-badge">{{ 'coin.price' | translate:{ price: (coin().price | number:'1.0-2') } }}</span>
      </div>

      <div class="coin-card__body">
        <h3 class="coin-card__title">{{ coin().name }}</h3>
        <div class="coin-card__meta">
          <p class="coin-card__year">{{ coin().year }}</p>
          <button
            type="button"
            class="coin-card__toggle"
            [class.coin-card__toggle--open]="detailsOpen()"
            (click)="$event.stopPropagation(); toggleDetails()">
            <span class="coin-card__toggle-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="sr-only">{{ detailsOpen() ? ('coin.hide' | translate) : ('coin.details' | translate) }}</span>
          </button>
        </div>

        @if (detailsOpen()) {
          <div class="coin-card__details">
            <p>{{ coin().description }}</p>
            <p>{{ 'coin.weight' | translate:{ weight: coin().weight } }}</p>
            <p>{{ 'filters.countryPlaceholder' | translate }}: {{ coin().country }}</p>
          </div>
        }
      </div>
    </article>
  `,
})
export class CoinCardComponent {
  coin = input<Coin>({} as Coin);
  selected = input<boolean>(false);
  selectedChange = output<boolean>();

  detailsOpen = signal(false);

  toggleDetails() {
    this.detailsOpen.update(v => !v);
  }

  toggleSelect() {
    const next = !this.selected();
    this.selectedChange.emit(next);
  }

}
