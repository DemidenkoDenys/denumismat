import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed, effect, EventEmitter, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { PricePipe } from '../../pipes/price.pipe';
import { S3Service } from '../../services/s3.service';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';
import { selectIsAdmin, selectIsLoggedIn } from '../../state/auth/auth.selectors';
import { selectIsSelectionLimitReached, selectSelectedCoinsCount } from '../../state/coins.selectors';
import { ToastService } from '../../services/toast.service';
import { selectServerIsAvailable } from '../../state/server.selectors';
import { map } from 'lodash';

export interface CoinImage {
  obverse: string | null;
  reverse: string | null;
  static: string | null;
}

export interface Coin {
  id: string;
  country: string;
  country_name: string;
  deno: string;
  year: number;
  soon?: boolean;
  price: number;
  disabled?: boolean;
  booked_at?: string | null; // ISO timestamp (if set, coin is booked/reserved)
  booked_by?: string | null; // User ID of the person who booked the coin
  ordered_at?: string | null; // ISO timestamp (if set, coin is ordered)
  ordered_by?: string | null; // User ID of the person who ordered the coin
  created_at?: string;
  is_deleted?: string | null; // ISO timestamp (if set, coin is deleted)
  description?: string; // Coin description
  youtube?: string; // id of youtube video
  ago: number; // how long ago coin was created in days
  mine?: boolean;
  tags?: string[]; // Tags like 'UNC', 'RARE', 'SALE'
  title?: string; // Pre-computed searchable title: "Country - Deno - Year - Description"
  discountPrice?: number; // 10% discounted price
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
  imports: [CommonModule, TranslateModule, PricePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  @if (coin(); as coin) {
    <article
      class="coin-card"
      [class.selected]="selected()"
      [class.coin-card--soon]="isSoon()"
      [class.coin-card--booked]="isBooked()"
      [class.coin-card--disabled]="coin.disabled"
      (click)="toggleSelect()"
      role="button"
      [attr.tabindex]="isBooked() ? -1 : 0"
      (keydown.space)="toggleSelect()"
      (keydown.enter)="toggleSelect()"
      [attr.aria-pressed]="selected()"
      [attr.aria-disabled]="isBooked()">

      <div class="coin-card__media">
        @if (!isBooked()) {
          <label class="coin-card__select" (click)="$event.stopPropagation()" [class.coin-card__select-limit]="selectionLimitReached() && !selected()">
            <input
              type="checkbox"
              [checked]="selected()"
              (change)="$event.stopPropagation(); toggleSelect()"
              [attr.aria-label]="'coin.select' | translate" />
          </label>
        }

        <div class="coin-card__slider" [class.coin-card__slider--placeholder]="isPlaceholder()">
          <img
            [src]="currentImageUrl()"
            [alt]="coin.deno + ' ' + coin.year"
            class="coin-card__image"
            [class.coin-card__image--placeholder]="isPlaceholder()"
            loading="lazy"
            (load)="onImageLoad($event)"
            (error)="onImageError($event)" />

          @if (availableImages().length > 1) {
            <button
              type="button"
              class="coin-card__nav coin-card__nav--prev"
              (click)="$event.stopPropagation(); previousImage()"
              [attr.aria-label]="'Previous image'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              class="coin-card__nav coin-card__nav--next"
              (click)="$event.stopPropagation(); nextImage()"
              [attr.aria-label]="'Next image'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

            <div class="coin-card__dots">
              @for (imgIndex of availableImages(); track imgIndex) {
                <button
                  type="button"
                  class="coin-card__dot"
                  [class.coin-card__dot--active]="currentImageIndex() === imgIndex"
                  (click)="$event.stopPropagation(); setImageIndex(imgIndex)"
                  [attr.aria-label]="'Image ' + (imgIndex + 1)">
                </button>
              }
            </div>
          }

          @if (!isPlaceholder()) {
            <button
              type="button"
              class="coin-card__lupa {{ coin.youtube ? 'video' : '' }}"
              (click)="$event.stopPropagation(); onLupaClick()"
              [attr.aria-label]="coin.youtube ? 'Play video' : 'Zoom image'">
              @if (coin.youtube) {
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="24" height="24" fill="none" stroke="currentColor" stroke-width="48">
                  <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
                </svg>
              } @else {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              }
            </button>
          }
        </div>

        <div class="coin-card__tags">
          @if (agos[coin.ago]; as ago) {
            <span class="coin-card__tag coin-card__tag--AGO">
              @if (coin.ago > 1 && coin.ago < 7) { {{ coin.ago }} }
              @if (coin.ago > 7) { 1+ }
              {{ 'agos.' + ago | translate }}
            </span>
          }

          @if (coin.tags!.length > 0) {
            @for (tag of coin.tags; track tag) {
              <span class="coin-card__tag" [class]="'coin-card__tag--' + tag.toUpperCase()">
                @if (tag.toLowerCase() === 'video') {
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 640 640" width="12" height="12" fill="white" class="coin-card__tag-icon">
                    <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" fill="none" stroke="currentColor" stroke-width="40"/>
                  </svg>
                }

                {{ 'filters.tag.' + tag.toUpperCase() | translate }}
              </span>
            }
          }
        </div>

        <span class="coin-card__price-badge">
          <span class="coin-card__original-price">{{ coin.price | price: false }}</span>&nbsp;
          <span class="coin-card__discounted-price">{{ 'coin.price' | translate:{ price: (coin.discountPrice | price) } }}</span>
        </span>
      </div>

      <div class="coin-card__body">
        @if (isAdmin()) {
          <h3 class="coin-card__title" (click)="$event.stopPropagation(); onCoinIdClick(coin)">{{ coin.id }}</h3>
        }

        @if (coin.soon) {
          <h3 class="coin-card__title">{{ coin.description }}</h3>
        } @else {
          <h3 class="coin-card__title"><strong>{{ countryFullName() }} - {{ coin.deno }}</strong> @if (coin.description) {
            - <span>{{ coin.description }}</span>
          } - <span class="coin-card__year">{{ coin.year }}</span>
          </h3>
        }

        @if (isAdmin()) {
          <small class="coin-card__title-date">{{ coin.created_at | date: "MM/dd/yyyy hh:mm" }}</small>
        }

        <div class="coin-card__meta">
          @if (detailsOpen() && detailsText().trim().length > 0 && isServerAvailable() && isLoggedIn()) {
            <button
              type="button"
              class="coin-card__submit"
              (click)="$event.stopPropagation(); submitDetails()"
              aria-label="{{ 'coin.send' | translate }}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              <span class="sr-only">{{ 'coin.send' | translate }}</span>
            </button>
          }

          @if (!(detailsOpen() && detailsText().trim().length > 0)) {
            <button
              type="button"
              class="coin-card__toggle w"
              [class.coin-card__toggle--open]="detailsOpen()"
              (click)="$event.stopPropagation(); toggleDetails()">
              <span class="coin-card__toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="sr-only">{{ detailsOpen() ? ('coin.hide' | translate) : ('coin.details' | translate) }}</span>
            </button>
          }
        </div>
      </div>

      @if (detailsOpen()) {
          <div class="coin-card__details">
            <textarea #detailsTextarea
              id="coin-desc-{{coin.id}}"
              type="text"
              class="coin-card__details-textarea"
              maxlength="100"
              [value]="detailsText()"
              [disabled]="!isServerAvailable() || !isLoggedIn()"
              (click)="$event.stopPropagation()"
              (input)="$event.stopPropagation(); detailsText.set($any($event.target).value)"
              [attr.placeholder]="isServerAvailable() ? (isLoggedIn() ? ('coin.askCoin' | translate) : ('coin.authForMessage' | translate)) : ('serverUnavailable' | translate)"
            ></textarea>
          </div>
        }
    </article>
  }
  `,
})
export class CoinCardComponent {
  private cd = inject(ChangeDetectorRef);
  private store = inject(Store);
  private toast = inject(ToastService);
  private s3Service = inject(S3Service);

  public agos: any = {
    '0': 'today',
    '1': 'yesterday',
    '2': 'days',
    '3': 'days',
    '4': 'days',
    '5': 'days',
    '6': 'days',
    '7': 'week',
    '8': 'week',
    '9': 'week',
    '10': 'week',
    '11': 'week',
    '12': 'week',
    '13': 'week',
    '14': 'week',
  };

  public isAdmin = toSignal(this.store.select(selectIsAdmin), { initialValue: false });
  public isLoggedIn = toSignal(this.store.select(selectIsLoggedIn), { initialValue: false });
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  public isServerAvailable = toSignal(this.store.select(selectServerIsAvailable), { initialValue: false });
  private extinctCountries = toSignal(this.store.select(selectExtinctCountries), { initialValue: null });

  // Watch global selected coins count to know when selection limit is reached
  public selectionLimitReached = toSignal(this.store.select(selectIsSelectionLimitReached));

  // Placeholder image URL for coins without images
  readonly placeholderImageUrl = 'assets/placeholder-image.jpg';

  coin = input<Coin>({} as Coin);
  images = input<any>(null);
  selected = input<boolean>(false);
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });
  selectedChange = output<boolean>();
  @Output() openSliderModal = new EventEmitter<{ coinId: string, alt: string, video?: string, index?: number }>();

  // Signal to store the image keys from S3
  public imageKeys = signal<string[]>([]);

  // Track the last loaded coin ID to prevent re-loading same coin
  private lastLoadedCoinId = signal<string>('');

  // Signal to store the loaded image URLs (lazy loaded)
  private loadedImageUrls = signal<Map<number, string>>(new Map());

  // Track images that have failed to load (by key/path)
  private failedImageKeys = signal<Set<string>>(new Set());

  // Track successfully loaded image indices
  private successfullyLoadedIndices = signal<Set<number>>(new Set());

  // Current image index for slider
  currentImageIndex = signal<number>(0);

  // Loading state for current image
  private isLoadingImage = signal<boolean>(false);

  // Get country full name from countries store
  countryFullName = computed(() => {
    const countriesMap = this.countries();
    const extinctsMap = this.extinctCountries();
    const coin = this.coin();

    if (!coin.country) {
      return coin.country_name || '';
    }

    // Merge countries and extinct countries
    const allCountriesMap = { ...countriesMap, ...extinctsMap };

    return allCountriesMap[coin.country]?.name || coin.country_name || '';
  });

  // Get only valid (non-failed) image indices
  validImageIndices = computed(() => {
    const keys = this.imageKeys();
    const failed = this.failedImageKeys();
    const indices: number[] = [];

    keys.forEach((key, index) => {
      if (!failed.has(key)) {
        indices.push(index);
      }
    });

    return indices;
  });

  // Get total count of available (non-failed) images
  imagesCount = computed(() => {
    const coin = this.coin();
    const images = this.images();
    return coin ? images[coin.id].length > 0 : 0;
  });

  // Get available images array (for dots indicator) - only valid indices
  availableImages = computed(() => {
    return this.validImageIndices();
  });

  // Current image URL based on slider index
  currentImageUrl = computed(() => {
    const index = this.currentImageIndex();
    const loadedUrls = this.loadedImageUrls();

    // Check if this index has been loaded
    if (loadedUrls.has(index)) {
      return loadedUrls.get(index)!;
    }

    // Return placeholder while loading or if no images
    return this.placeholderImageUrl;
  });

  // Check if current image is placeholder
  isPlaceholder = computed(() => {
    const url = this.currentImageUrl();
    return !url || url === this.placeholderImageUrl || url.includes('assets/placeholder') || url.includes('placeholder-image');
  });

  // Whether this coin is booked/reserved (truthy `booked_at` means booked)
  isBooked = computed(() => !this.isAdmin() && !!this.coin().booked_at && this.coin().disabled);
  isSoon = computed(() => !this.isAdmin() && !!this.coin().soon);

  // Computed signal for image URL (backward compatibility)
  imageUrl = computed(() => this.currentImageUrl());

  constructor() {
    effect(() => {
      const coin = this.coin();
      if (!coin || !coin.id) return;

      if (!coin.disabled) {
        try {
          const stored = localStorage.getItem('denumismat.coins');
          if (stored) {
            const coinsMap = JSON.parse(stored);
            if (coinsMap && typeof coinsMap === 'object' && coinsMap[coin.id]) {
              // Only emit if not already selected
              if (!this.selected()) {
                this.selectedChange.emit(true);
              }
            }
          }
        } catch { }
      }
    });

    effect(() => {
      const c = this.coin();
      const lastId = this.lastLoadedCoinId();

      // Only load if coin ID actually changed
      if (c.id && c.id !== lastId) {
        // Reset state for new coin
        this.currentImageIndex.set(0);
        this.loadedImageUrls.set(new Map());
        this.imageKeys.set([]);
        this.failedImageKeys.set(new Set());
        this.successfullyLoadedIndices.set(new Set());
        this.lastLoadedCoinId.set(c.id);
      }
    });

    effect(() => {
      const coin = this.coin();
      const images = this.images();

      if (coin && images) {
        const keys = map(this.images()[coin.id] ?? [], key => coin.id + '/' + key);
        this.imageKeys.set(keys);

        // Load first image immediately if available
        if (keys.length > 0) {
          this.loadImageAtIndex(0);
        }
      }
    });
  }

  // Load image at specific index on demand
  private loadImageAtIndex(index: number) {
    const keys = this.imageKeys();
    const loadedUrls = this.loadedImageUrls();

    // Check if already loaded
    if (loadedUrls.has(index) || index >= keys.length) {
      return;
    }

    const key = keys[index];

    this.isLoadingImage.set(true);
    this.s3Service.getSignedUrl(key).subscribe(url => {
      if (url) {
        const newMap = new Map(this.loadedImageUrls());
        newMap.set(index, url);
        this.loadedImageUrls.set(newMap);
      }
      this.isLoadingImage.set(false);
    });
  }

  // Slider navigation methods with lazy loading - navigate only through valid images
  nextImage() {
    const validIndices = this.validImageIndices();
    if (validIndices.length > 1) {
      const currentIdx = this.currentImageIndex();
      const currentPos = validIndices.indexOf(currentIdx);
      const nextPos = (currentPos + 1) % validIndices.length;
      const nextIndex = validIndices[nextPos];
      this.currentImageIndex.set(nextIndex);
      // Load next image if not already loaded
      this.loadImageAtIndex(nextIndex);
    }
  }

  previousImage() {
    const validIndices = this.validImageIndices();
    if (validIndices.length > 1) {
      const currentIdx = this.currentImageIndex();
      const currentPos = validIndices.indexOf(currentIdx);
      const prevPos = (currentPos - 1 + validIndices.length) % validIndices.length;
      const prevIndex = validIndices[prevPos];
      this.currentImageIndex.set(prevIndex);
      // Load previous image if not already loaded
      this.loadImageAtIndex(prevIndex);
    }
  }

  setImageIndex(index: number) {
    this.currentImageIndex.set(index);
    // Load image at this index if not already loaded
    this.loadImageAtIndex(index);
  }

  formattedPrice = computed(() => {
    // Deprecated: using pipe in template
    return '';
  });

  detailsOpen = signal(false);
  detailsText = signal('');
  coinMessageSent = output<{ coin: Coin; message: string }>();

  // reference to textarea element so we can focus when details are shown
  @ViewChild('detailsTextarea') detailsTextarea?: import('@angular/core').ElementRef<HTMLTextAreaElement>;

  toggleDetails() {
    this.detailsOpen.update(v => {
      const next = !v;
      if (!v && next) {
        // details are being opened; focus textarea on next tick
        setTimeout(() => {
          this.detailsTextarea?.nativeElement?.focus();
        });
      }
      return next;
    });
  }

  submitDetails() {
    const coinId = this.coin()?.id;
    const message = this.detailsText().trim();

    if (!coinId || !message) return;

    this.coinMessageSent.emit({ coin: this.coin(), message });

    this.detailsText.set('');
    this.detailsOpen.set(false);
  }

  toggleSelect() {
    // Prevent selecting more than allowed (UI-level guard). Reducer is also defensive.
    if (!this.selected() && this.selectionLimitReached()) {
      return; // silently ignore toggle when limit reached
    }

    const next = !this.selected();
    this.selectedChange.emit(next);
  }

  // Handle successful image loading
  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const currentSrc = img.src;
    const isPlaceholder = !currentSrc || currentSrc.includes('placeholder') || currentSrc.includes('assets/');

    if (!isPlaceholder) {
      // Find which index this image belongs to
      const loadedUrls = this.loadedImageUrls();
      for (const [index, url] of loadedUrls) {
        if (url === currentSrc) {
          this.successfullyLoadedIndices.update(set => {
            const newSet = new Set(set);
            newSet.add(index);
            return newSet;
          });
          break;
        }
      }
    }
  }

  // Handle image loading errors
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const currentSrc = img.src;

    // Mark this key/URL as failed
    if (currentSrc && !currentSrc.includes('placeholder')) {
      // Find which key/index this belongs to
      const keys = this.imageKeys();
      const loadedUrls = this.loadedImageUrls();

      for (const [index, url] of loadedUrls) {
        if (url === currentSrc) {
          const key = keys[index];
          this.failedImageKeys.update(set => {
            const newSet = new Set(set);
            newSet.add(key);
            return newSet;
          });

          // Update loadedImageUrls to use placeholder for this index
          const newMap = new Map(this.loadedImageUrls());
          newMap.set(index, this.placeholderImageUrl);
          this.loadedImageUrls.set(newMap);

          // Try to navigate to next valid image if current one failed
          const validIndices = this.validImageIndices();
          if (validIndices.length > 0 && !validIndices.includes(this.currentImageIndex())) {
            this.currentImageIndex.set(validIndices[0]);
            this.loadImageAtIndex(validIndices[0]);
          }
          break;
        }
      }
    }

    // Set to placeholder
    if (img.src !== this.placeholderImageUrl) {
      img.src = this.placeholderImageUrl;
    }
  }

  showImageSliderModal = signal(false);
  sliderImages = signal<string[]>([]);
  sliderAltText = signal('Coin image');

  onLupaClick() {
    const alt = this.coin().deno + ' ' + this.coin().year;
    this.openSliderModal.emit({ coinId: this.coin().id, alt, video: this.coin().youtube, index: this.currentImageIndex() });
  }

  onCoinIdClick(coin: any) {
    navigator.clipboard.writeText(coin.id).then(() => {
      this.toast.show(coin.id + ' - copied', { duration: 3000 });
      this.cd.detectChanges();
    })
  }

  closeImageSliderModal = () => {
    this.showImageSliderModal.set(false);
  }
}
