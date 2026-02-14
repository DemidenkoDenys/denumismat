import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  type?: ToastType;
  duration?: number; // ms
  actionLabel?: string;
  action?: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  actionLabel?: string;
  action?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private translate = inject(TranslateService);
  private toastsSub = new BehaviorSubject<ToastItem[]>([]);
  private timeouts = new Map<string, any>();

  get toasts$(): Observable<ToastItem[]> {
    return this.toastsSub.asObservable();
  }

  private genId() {
    return Math.random().toString(36).slice(2, 9);
  }

  show(message: string, opts: ToastOptions = {}): string {
    const id = this.genId();
    const toast: ToastItem = {
      id,
      message,
      type: opts.type ?? 'info',
      duration: typeof opts.duration === 'number' ? opts.duration : 4000,
      actionLabel: opts.actionLabel,
      action: opts.action
    };

    this.translate.get(message).subscribe((translated: string) => {
      toast.message = translated;
      const list = this.toastsSub.getValue();
      list.push(toast);
      this.toastsSub.next(list);

      if (toast.duration > 0) {
        const t = setTimeout(() => this.dismiss(id), toast.duration);
        this.timeouts.set(id, t);
      }
    });

    return id;
  }

  success(message: string, duration?: number) { return this.show(message, { type: 'success', duration }); }
  info(message: string, duration?: number) { return this.show(message, { type: 'info', duration }); }
  warn(message: string, duration?: number) { return this.show(message, { type: 'warning', duration }); }
  error(message: string, duration?: number) { return this.show(message, { type: 'error', duration }); }

  dismiss(id: string) {
    const list = this.toastsSub.getValue().filter(t => t.id !== id);
    this.toastsSub.next(list);
    const to = this.timeouts.get(id);
    if (to) {
      clearTimeout(to);
      this.timeouts.delete(id);
    }
  }

  clear() {
    this.toastsSub.next([]);
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts.clear();
  }
}
