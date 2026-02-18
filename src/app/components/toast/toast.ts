import { Component, inject, signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, type ToastItem } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-root" aria-live="polite" aria-atomic="true">
      <div class="toast-wrap">
        @for (t of toasts(); track t.message) {
          <div class="toast" (click)="dismiss(t.id)" [class]="'toast--' + t.type">
            <div class="toast__body">
              <div class="toast__message">{{ t.message }}</div>
            </div>

            <button  type="button" class="toast__close" aria-label="Close" (click)="dismiss(t.id); $event.stopPropagation()">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="#fff" d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 005.7 7.11L10.59 12l-4.89 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  cd = inject(ChangeDetectorRef);
  toasts = signal<ToastItem[]>([]);
  service = inject(ToastService);

  ngOnInit() {
    this.service.toasts$.subscribe(list => {
      this.toasts.set(list);
      this.cd.detectChanges();
    });
  }

  dismiss(id: string) { this.service.dismiss(id); }
}
