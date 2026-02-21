import { Component, ChangeDetectionStrategy, input, output, signal, inject, OnInit, OnDestroy, PLATFORM_ID, Renderer2, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" (mousedown)="onBackdropMouseDown($event)" (mouseup)="onBackdropMouseUp($event)">
      <div class="modal-container" (mousedown)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title() }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>

        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class BaseModalComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  // Inputs
  title = input<string>('Modal');

  // Outputs
  onClose = output<void>();

  // Internal state
  private isBackdropMouseDown = false;

  @HostListener('document:keydown.escape')
  onEscape() {
    this.close();
  }

  onBackdropMouseDown(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.isBackdropMouseDown = true;
    }
  }

  onBackdropMouseUp(event: MouseEvent) {
    if (this.isBackdropMouseDown && event.target === event.currentTarget) {
      this.close();
    }
    this.isBackdropMouseDown = false;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.removeStyle(this.document.body, 'overflow');
    }
  }

  close() {
    this.onClose.emit();
  }

  // Utility methods for auth modal
  showModal() {
    // Modal is shown when component is rendered
  }

  hideModal() {
    this.close();
  }

  setTitle(title: string) {
    // Title is set via input binding
  }

  isVisible(): boolean {
    return true; // Modal is always visible when rendered
  }
}
