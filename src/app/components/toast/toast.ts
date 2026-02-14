import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
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
          </div>
        }
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit {
  private service = inject(ToastService);
  toasts = signal<ToastItem[]>([]);

  ngOnInit() {
    this.service.toasts$.subscribe(list => {
      this.toasts.set(list);
    });
  }

  dismiss(id: string) { this.service.dismiss(id); }
}
