import { Component, inject } from "@angular/core";
import { ToastService } from "../service/toast-service";
import { Toast } from "../model/toast-model";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-toast",
  template: `
    @if (toast(); as currentToast) {
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

    const typeClasses = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-yellow-500",
    };

    return `${baseClasses} ${typeClasses[toast.type] || ""}`;
  }

  hideToast() {
    this.toastService.hide();
  }
}
