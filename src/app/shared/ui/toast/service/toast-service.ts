import { Injectable, signal } from "@angular/core";
import { Toast } from "../model/toast-model";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toast = signal<Toast | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private confirmResolver: ((value: boolean) => void) | null = null;

  show(toast: Toast) {
    this.toast.set(toast);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
    // Pas d'auto-hide pour les confirmations
    if (toast.type !== 'confirm') {
      this.timeoutId = setTimeout(() => this.hide(), toast.duration ?? 3000);
    }
  }

  hide() {
    this.toast.set(null);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  // API de confirmation
  confirm(options: { message: string; confirmText?: string; cancelText?: string; duration?: number }): Promise<boolean> {
    // Fermer tout toast en cours
    this.hide();

    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
      this.show({
        type: 'confirm',
        message: options.message,
        confirmText: options.confirmText ?? 'Confirmer',
        cancelText: options.cancelText ?? 'Annuler',
        duration: options.duration, // ignoré pour confirm
        showClose: true,
      });
    });
  }

  confirmAccept(): void {
    const resolver = this.confirmResolver;
    this.confirmResolver = null;
    this.hide();
    resolver?.(true);
  }

  confirmCancel(): void {
    const resolver = this.confirmResolver;
    this.confirmResolver = null;
    this.hide();
    resolver?.(false);
  }
}
