import { Injectable, signal, computed } from '@angular/core';
import type { ToastData, ToastType } from '@shared/ui';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastData[]>([]);

  readonly toasts = this._toasts.asReadonly();
  readonly hasToasts = computed(() => this._toasts().length > 0);

  private show(type: ToastType, title: string, message?: string): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const toast: ToastData = {
      id,
      type,
      title,
      message,
    };

    this._toasts.update((toasts) => [...toasts, toast]);

    // Auto-dismiss après 5 secondes
    setTimeout(() => this.dismiss(id), 5000);
  }

  success(title: string, message?: string): void {
    this.show('success', title, message);
  }

  danger(title: string, message?: string): void {
    this.show('danger', title, message);
  }

  dismiss(id: string): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
