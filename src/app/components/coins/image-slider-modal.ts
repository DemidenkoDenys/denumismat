import { Component, ChangeDetectionStrategy, input, signal, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { S3Service } from '../../services/s3.service';

@Component({
  selector: 'app-image-slider-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-slider-modal__backdrop" (click)="closeModal()"></div>
    <div class="image-slider-modal">
      <button class="image-slider-modal__close" (click)="closeModal()" aria-label="Close">
        <svg viewBox="0 0 24 24" width="24" height="24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="image-slider-modal__slider">
        <button class="image-slider-modal__nav image-slider-modal__nav--prev" (click)="prevImage()" [disabled]="images().length < 2">
          <svg viewBox="0 0 24 24" width="48" height="48"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <img [src]="images()[currentIndex()]" class="image-slider-modal__image" [alt]="altText()" (click)="closeModal()" />
        <button class="image-slider-modal__nav image-slider-modal__nav--next" (click)="nextImage()" [disabled]="images().length < 2">
          <svg viewBox="0 0 24 24" width="48" height="48"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="image-slider-modal__dots">
        <button *ngFor="let img of images(); let i = index" class="image-slider-modal__dot" [class.active]="currentIndex() === i" (click)="setIndex(i)"></button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: []
})
export class ImageSliderModalComponent {
  close = output<void>();
  coinId = input<string>('');
  altText = input<string>('Coin image');
  currentIndex = signal(0);
  images = signal<string[]>([]);

  private s3Service = inject(S3Service);

  // Load images when coinId changes
  constructor() {
    effect(() => {
      const id = this.coinId();
      if (id) {
        this.s3Service.getCoinFolderImageKeys(id).subscribe(keys => {
          const urls: string[] = [];
          let loaded = 0;
          keys.forEach((key, idx) => {
            this.s3Service.getSignedUrl(key).subscribe(url => {
              urls[idx] = url || 'assets/placeholder-image.jpg';
              loaded++;
              if (loaded === keys.length) {
                this.images.set(urls);
                this.currentIndex.set(0);
              }
            });
          });
          if (keys.length === 0) {
            this.images.set(['assets/placeholder-image.jpg']);
            this.currentIndex.set(0);
          }
        });
      }
    });
  }

  nextImage() {
    if (this.images().length < 2) return;
    this.currentIndex.update(idx => (idx + 1) % this.images().length);
  }

  prevImage() {
    if (this.images().length < 2) return;
    this.currentIndex.update(idx => (idx - 1 + this.images().length) % this.images().length);
  }

  setIndex(i: number) {
    this.currentIndex.set(i);
  }

  closeModal() {
    this.close.emit();
  }
}
