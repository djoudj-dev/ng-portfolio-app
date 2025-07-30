import { Injectable, signal } from "@angular/core";
import { Toast } from "../model/toast-model";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  toast = signal<Toast | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  show(toast: Toast) {
    this.toast.set(toast);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.hide(), toast.duration ?? 3000);
  }

  hide() {
    this.toast.set(null);
  }
}
