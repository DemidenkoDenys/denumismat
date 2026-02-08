import { Component, ChangeDetectionStrategy, input, output, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { S3Service } from '../../services/s3.service';
import { selectCountries, selectExtinctCountries } from '../../state/countries.selectors';

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
  price: number;
  description?: string; // Coin description
  imageUrl?: string; // CloudFront image URL
  thumbnailUrl?: string; // CloudFront thumbnail URL
  highResUrl?: string; // CloudFront high resolution URL
  images?: CoinImage; // Multiple image views
  imageFilenames?: string[]; // Array of image filenames in the coin folder (from Firestore)
  tags?: string[]; // Tags like 'UNC', 'RARE', 'SALE'
  title?: string; // Pre-computed searchable title: "Country - Deno - Year - Description"
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
        <div class="coin-card__slider" [class.coin-card__slider--placeholder]="isPlaceholder()">
          <img
            [src]="currentImageUrl()"
            [alt]="coin().deno + ' ' + coin().year"
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
        </div>

        @if (coin().tags && coin().tags!.length > 0) {
          <div class="coin-card__tags">
            @for (tag of coin().tags; track tag) {
              <span class="coin-card__tag" [class]="'coin-card__tag--' + tag.toLowerCase()">{{ tag.toUpperCase() }}</span>
            }
          </div>
        }

        <span class="coin-card__price-badge">{{ 'coin.price' | translate:{ price: formattedPrice() } }}</span>
      </div>

      <div class="coin-card__body">
        <h3 class="coin-card__title">{{ countryFullName() }} - {{ coin().deno }} - <span class="coin-card__year">{{ coin().year }}</span>{{ coin().description ? ' - ' + coin().description : '' }}</h3>
        <div class="coin-card__meta">
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
            <p>{{ 'filters.countryPlaceholder' | translate }}: {{ countryFullName() }}</p>
          </div>
        }
      </div>
    </article>
  `,
})
export class CoinCardComponent {
  private s3Service = inject(S3Service);
  private store = inject(Store);

  // Get countries from store
  private countries = toSignal(this.store.select(selectCountries), { initialValue: null });
  private extinctCountries = toSignal(this.store.select(selectExtinctCountries), { initialValue: null });

  // Placeholder image URL for coins without images
  readonly placeholderImageUrl = 'assets/placeholder-image.jpg';

  // Set to true if using private S3 bucket with signed URLs
  private readonly useSignedUrls = true;

  // Set to false to disable AWS S3 image loading (saves costs, shows placeholders only)
  private readonly LOAD_IMAGES_FROM_S3 = true;

  coin = input<Coin>({} as Coin);
  selected = input<boolean>(false);
  conversionRate = input<number>(1);
  currencyFormat = input<{ symbol: string; short: string; start: boolean }>({ symbol: '$', short: '$', start: true });
  selectedChange = output<boolean>();

  // Signal to store the image keys from S3
  private imageKeys = signal<string[]>([]);

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
  availableImagesCount = computed(() => {
    const validIndices = this.validImageIndices();
    return validIndices.length > 0 ? validIndices.length : 1; // At least 1 for placeholder
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
    return url === this.placeholderImageUrl || url.includes('assets/placeholder') || url.includes('placeholder-image');
  });

  // Computed signal for image URL (backward compatibility)
  imageUrl = computed(() => this.currentImageUrl());

  constructor() {
    // Get list of image keys when coin changes
    if (this.useSignedUrls && this.LOAD_IMAGES_FROM_S3) {
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

          // Get list of image keys (without loading them)
          // Pass imageFilenames from Firestore if available
          this.s3Service.getCoinFolderImageKeys(c.id, c.imageFilenames).subscribe(keys => {
            this.imageKeys.set(keys);

            // Load first image immediately if available
            if (keys.length > 0) {
              this.loadImageAtIndex(0);
            }
          });
        }
      });
    }
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
    // console.log(`🔄 Lazy loading image ${index + 1}/${keys.length}: ${key}`);

    if (this.coin().id === 'CC10FR1975') {
      console.log(`[${this.coin().id}] Loading image at index ${index}: ${key}`);
    }

    this.isLoadingImage.set(true);
    this.s3Service.getSignedUrl(key).subscribe(url => {
      if (url) {
        if (this.coin().id === 'CC10FR1975') {
          console.log(`[${this.coin().id}] Got signed URL for index ${index}: ${url}`);
        }
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
    const price = (this.coin().price * this.conversionRate()).toFixed(2);
    const format = this.currencyFormat();
    const currency = format.short;
    // Add thousands separator (space)
    const [intPart, decPart] = price.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const formattedPrice = `${formattedInt}.${decPart}`;
    return format.start ? `${currency} ${formattedPrice}` : `${formattedPrice} ${currency}`;
  });

  detailsOpen = signal(false);

  toggleDetails() {
    this.detailsOpen.update(v => !v);
  }

  toggleSelect() {
    const next = !this.selected();
    this.selectedChange.emit(next);
  }

  // Handle successful image loading
  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const currentSrc = img.src;
    const isPlaceholder = currentSrc.includes('placeholder') || currentSrc.includes('assets/');

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
          if (this.coin().id === 'CC10FR1975') {
            console.log(`[${this.coin().id}] ✅ Image loaded successfully at index ${index}: ${currentSrc}`);
          }
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
          if (this.coin().id === 'CC10FR1975') {
            console.log(`[${this.coin().id}] ❌ Image failed to load at index ${index}: ${currentSrc}`);
          }

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
}
