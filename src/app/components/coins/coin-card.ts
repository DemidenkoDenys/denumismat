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
  highResUrl?: string;
  category: string[];
  country: string;
  isBooked: boolean;
}

/**
 * CoinCardComponent
 *
 * Displays a coin card with:
 * - Selectable entire card area
 * - Coin image with high-res preview on hover
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

      <div class="coin-card__media" (mouseenter)="loadHighRes()" (mouseleave)="cancelPreview()">
        <img [src]="currentSrc()" alt="{{ coin().name }} thumbnail" class="coin-card__image" />
        <div *ngIf="isLoading()" class="coin-card__spinner" aria-hidden="true"></div>
      </div>

      <div class="coin-card__body">
        <h3 class="coin-card__title">{{ coin().name }} <span class="coin-card__year">({{ coin().year }})</span></h3>
        <p class="coin-card__price">{{ 'coin.price' | translate:{ price: (coin().price | number:'1.0-2') } }}</p>

        <button
          type="button"
          class="coin-card__toggle"
          (click)="$event.stopPropagation(); toggleDetails()">
          {{ detailsOpen() ? ('coin.hide' | translate) : ('coin.details' | translate) }}
        </button>

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
  isLoading = signal(false);
  highResLoaded = signal(false);
  currentSrc = signal<string>('');

  private highResTimeout: any = null;

  ngOnInit() {
    const img = this.coin().imageUrl;
    if (img) {
      this.currentSrc.set(img);
    }
  }

  toggleDetails() {
    this.detailsOpen.update(v => !v);
  }

  toggleSelect() {
    const next = !this.selected();
    this.selectedChange.emit(next);
  }

  loadHighRes() {
    if (!this.coin() || this.highResLoaded()) return;
    this.isLoading.set(true);
    // simulate async high-res load
    this.highResTimeout = setTimeout(() => {
      const hr = this.coin().highResUrl ?? this.coin().imageUrl;
      this.currentSrc.set(hr);
      this.isLoading.set(false);
      this.highResLoaded.set(true);
    }, 700);
  }

  cancelPreview() {
    if (this.highResTimeout) {
      clearTimeout(this.highResTimeout);
      this.highResTimeout = null;
    }
    if (this.highResLoaded()) return;
    this.isLoading.set(false);
    // revert to thumbnail
    if (this.coin().imageUrl) this.currentSrc.set(this.coin().imageUrl);
  }
}
