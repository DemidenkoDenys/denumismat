import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-coin-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="coin-card" [class.selected]="selected()">
      <label class="coin-card__select">
        <input type="checkbox" [checked]="selected()" (change)="toggleSelect()" aria-label="Select coin" />
      </label>

      <div class="coin-card__media" (mouseenter)="loadHighRes()" (mouseleave)="cancelPreview()">
        <img [src]="currentSrc()" alt="{{ coin().name }} thumbnail" class="coin-card__image" />
        <div *ngIf="isLoading()" class="coin-card__spinner" aria-hidden="true"></div>
      </div>

      <div class="coin-card__body">
        <h3 class="coin-card__title">{{ coin().name }} <span class="coin-card__year">({{ coin().year }})</span></h3>
        <p class="coin-card__price">{{ coin().price | number:'1.0-2' }} USD</p>

        <button type="button" class="coin-card__toggle" (click)="toggleDetails()">
          {{ detailsOpen() ? 'Hide' : 'Details' }}
        </button>

        @if (detailsOpen()) {
          <div class="coin-card__details">
            <p>{{ coin().description }}</p>
            <p><strong>Weight:</strong> {{ coin().weight }} g</p>
            <p><strong>Country:</strong> {{ coin().country }}</p>
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
