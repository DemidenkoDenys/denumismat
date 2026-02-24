import { Component, ChangeDetectionStrategy, input, signal, output, inject, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { S3Service } from '../../services/s3.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

function toEmbedUrl(youtubeVideoId: string): string {
  return `https://www.youtube.com/embed/${youtubeVideoId}`;
}

@Component({
  selector: 'app-image-slider-modal',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="image-slider-modal__backdrop" (click)="closeModal()"></div>
    <div class="image-slider-modal">
      <button class="image-slider-modal__close" (click)="closeModal()" aria-label="Close">
        <svg viewBox="0 0 24 24" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div class="image-slider-modal__slider" (click)="closeModal()">
        <button class="image-slider-modal__nav image-slider-modal__nav--prev" (click)="$event.stopPropagation(); prevImage()" [disabled]="imageUrls().length < 2">
          <svg viewBox="0 0 24 24" width="48" height="48"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        @if (imageUrls()[currentIndex()]?.startsWith('VIDEO:')) {
          <div class="image-slider-modal__video-container">
            <iframe
              [src]="(imageUrls()[currentIndex()] | slice:6) | safeUrl"
              frameborder="0"
              allowfullscreen
              class="image-slider-modal__video">
            </iframe>
          </div>
        } @else {
          <img [src]="imageUrls()[currentIndex()]" class="image-slider-modal__image" [alt]="altText()" (click)="closeModal()" />
        }

        @if (imageUrls().length > 0) {
          <button class="image-slider-modal__nav image-slider-modal__nav--next" (click)="$event.stopPropagation(); nextImage()" [disabled]="imageUrls().length < 2">
            <svg viewBox="0 0 24 24" width="48" height="48"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        }
      </div>

      <div class="image-slider-modal__dots">
        <button *ngFor="let img of imageUrls(); let i = index"
                class="image-slider-modal__dot"
                [class.active]="currentIndex() === i"
                [class.video]="img?.startsWith('VIDEO:')"
                (click)="setIndex(i)">
          <svg *ngIf="img?.startsWith('VIDEO:')" xmlns="http://www.w3.org/2000/svg" viewBox="60 90 640 640" width="16" height="16" fill="lightblue">
            <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
          </svg>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: []
})
export class ImageSliderModalComponent {
  close = output<void>();
  coinId = input<string>('');
  images = input<any>(null);
  video = input<string | null>(null);
  altText = input<string>('Coin image');
  imageUrls = signal<string[]>([]);
  currentIndex = signal(0);

  private s3Service = inject(S3Service);

  // Load images when coinId changes
  constructor() {
    effect(() => {
      const id = this.coinId();
      const video = this.video();
      const images = this.images();

      if (id && images) {
        const keys = images[id] as string[];
        const urls: string[] = [];
        let loaded = 0;

        keys.forEach((key, idx) => {
          this.s3Service.getSignedUrl(id + '/' + key).subscribe(url => {
            urls[idx] = url || 'assets/placeholder-image.jpg';

            loaded++;

            if (loaded === keys.length) {
              // after images loaded, append video slide if valid youtube link
              if (video) {
                urls.unshift('VIDEO:' + toEmbedUrl(video));
              }
              this.imageUrls.set(urls);
              this.currentIndex.set(0);
            }
          });
        });

        if (keys.length === 0) {
          urls.push('assets/placeholder-image.jpg');
          if (video) {
            urls.push('VIDEO:' + toEmbedUrl(video));
          }
          this.imageUrls.set(urls);
          this.currentIndex.set(0);
        }
      } else if (video) {
        // no images but video present
        this.imageUrls.set(['VIDEO:' + toEmbedUrl(video)]);
        this.currentIndex.set(0);
      }
    });
  }

  nextImage() {
    if (this.imageUrls().length < 2) return;
    this.currentIndex.update(idx => (idx + 1) % this.imageUrls().length);
  }

  prevImage() {
    if (this.imageUrls().length < 2) return;
    this.currentIndex.update(idx => (idx - 1 + this.imageUrls().length) % this.imageUrls().length);
  }

  setIndex(i: number) {
    this.currentIndex.set(i);
  }

  closeModal() {
    this.close.emit();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // close on escape
    if (event.key === 'Escape') {
      this.closeModal();
      return;
    }

    // navigate slides with arrows
    if (event.key === 'ArrowLeft') {
      this.prevImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    }
  }
}
