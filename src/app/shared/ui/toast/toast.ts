import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import type { ToastData } from '@shared/ui';
import { ToastService } from '@shared/ui';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-toast',
  imports: [SvgIcon],
  template: `
    <div
      [class]="getToastClasses()"
      class="flex items-center gap-3 p-3 mb-2 rounded-md shadow-lg border-l-4 animate-slide-in"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <app-svg-icon
        [name]="getIcon()"
        [width]="'20'"
        [height]="'20'"
        [iconClass]="'w-5 h-5'"
      />

      <div class="flex-1">
        <p class="text-sm font-semibold">{{ toast().title }}</p>
        @if (toast().message) {
          <p class="text-xs mt-1 opacity-90">{{ toast().message }}</p>
        }
      </div>

      <button
        type="button"
        (click)="onDismiss()"
        class="p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Fermer"
      >
        <app-svg-icon
          name="lucide:circle-x"
          [width]="'16'"
          [height]="'16'"
          [iconClass]="'w-4 h-4'"
        />
      </button>
    </div>
  `,
  styles: `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly toastService = inject(ToastService);
  readonly toast = input.required<ToastData>();

  getToastClasses(): string {
    return this.toast().type === 'success'
      ? 'bg-green-50 border-green-500 text-green-900'
      : 'bg-red-50 border-red-500 text-red-900';
  }

  getIcon(): string {
    return this.toast().type === 'success'
      ? 'qlementine-icons:success-12'
      : 'material-symbols:dangerous';
  }

  onDismiss(): void {
    this.toastService.dismiss(this.toast().id);
  }
}
