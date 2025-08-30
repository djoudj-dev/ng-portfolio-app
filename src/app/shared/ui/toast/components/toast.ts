import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { ToastService } from "../service/toast-service";
import { Toast } from "../model/toast-model";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-toast",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (toast(); as currentToast) {
      <!-- Mode confirmation -->
      @if (currentToast.type === 'confirm') {
        <div class="fixed bottom-4 right-4 z-50 max-w-sm w-[92vw] sm:w-[420px] bg-background border border-accent rounded-lg shadow-lg p-4 text-text">
          <div class="flex items-start gap-3">
            <img ngSrc="/icons/warning.svg" alt="Attention" class="w-5 h-5 icon-invert mt-0.5" height="20" width="20" />
            <div class="flex-1">
              <p class="text-sm md:text-base">{{ currentToast.message }}</p>
              <div class="mt-3 flex gap-2 justify-end">
                <button class="px-3 py-1 rounded bg-secondary text-white hover:bg-secondary/80" (click)="onCancel()">{{ currentToast.cancelText || 'Annuler' }}</button>
                <button class="px-3 py-1 rounded bg-red text-white hover:bg-red/80" (click)="onConfirm()">{{ currentToast.confirmText || 'Confirmer' }}</button>
              </div>
            </div>
            @if (currentToast.showClose !== false) {
              <button class="opacity-70 hover:opacity-100" (click)="onCancel()" aria-label="Fermer le toast">
                <img ngSrc="/icons/close.svg" alt="Fermer" class="w-4 h-4 icon-invert" width="16" height="16" />
              </button>
            }
          </div>
        </div>
      } @else {
        <!-- Toasters classiques -->
        <div [class]="getToastClasses(currentToast)">
          <div class="flex items-center justify-between w-full">
            <p class="text-sm md:text-base">{{ currentToast.message }}</p>
            <button
              (click)="hideToast()"
              class="ml-4 text-text hover:text-primary focus:outline-none focus:ring-2 focus:ring-background focus:ring-opacity-50 rounded"
              aria-label="Close toast"
            >
              <img
                ngSrc="/icons/close.svg"
                alt="Close"
                class="h-5 w-5 icon-invert"
                height="24"
                width="24"
              />
            </button>
          </div>
        </div>
      }
    }
  `,
  imports: [NgOptimizedImage],
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  toast = this.toastService.toast;

  getToastClasses(toast: Toast | null) {
    if (!toast) return "";

    const baseClasses =
      "fixed bottom-4 right-4 z-50 p-4 rounded-md shadow-lg text-white transition-all duration-300 ease-in-out";

    const typeClasses: Record<string, string> = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
    };

    return `${baseClasses} ${typeClasses[toast.type] || "bg-gray-700"}`;
  }

  hideToast() {
    this.toastService.hide();
  }

  onConfirm() {
    this.toastService.confirmAccept();
  }
  onCancel() {
    this.toastService.confirmCancel();
  }
}
