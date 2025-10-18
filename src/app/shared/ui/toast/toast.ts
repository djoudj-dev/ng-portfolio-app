import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ToastData } from '@shared/ui';
import { ToastService } from '@shared/ui';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';
import {
  TOAST_STYLE_MAP,
  TOAST_ICON_MAP,
  TOAST_ARIA_LABEL_MAP,
  type ToastStyle,
} from './config/toast.config';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, SvgIcon],
  template: `
    <div
      [class]="'transition-all duration-200 bg-background ' + toastStyle().borderColor"
      class="flex items-start p-2 mb-2 rounded-md shadow border-l-2 animate-slide-in-right"
      role="alert"
      [attr.aria-live]="toast().type === 'danger' ? 'assertive' : 'polite'"
      aria-atomic="true"
      [attr.aria-label]="getAriaLabel()"
    >
      <!-- Icône -->
      <div class="flex-shrink-0 mr-2">
        <app-svg-icon
          [name]="toastIcon()"
          [width]="'20'"
          [height]="'20'"
          [iconClass]="'w-5 h-5'"
          [class]="toastStyle().iconColor"
        />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-xs text-text font-semibold mb-1" [class]="toastStyle().textColor">
          {{ toast().title }}
        </p>
        @if (toast().message) {
          <p class="text-xs text-text" [class]="toastStyle().textColor">
            {{ toast().message }}
          </p>
        }
      </div>

      @if (toast().dismissible) {
        <button
          type="button"
          (click)="onDismiss()"
          class="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-background focus:outline-none focus:ring-2
          focus:ring-offset-2 transition-colors"
          [class]="toastStyle().dismissButtonColor"
          aria-label="Fermer la notification"
        >
          <app-svg-icon
            name="lucide:circle-x"
            [width]="'20'"
            [height]="'20'"
            [iconClass]="'w-5 h-5 text-text'"
            [class]="toastStyle().iconColor"
          />
        </button>
      }
    </div>
  `,
  styles: `
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.2s ease-out;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly toastService = inject(ToastService);

  readonly toast = input.required<ToastData>();

  readonly toastStyle = computed<ToastStyle>(() => TOAST_STYLE_MAP[this.toast().type]);
  readonly toastIcon = computed<string>(() => TOAST_ICON_MAP[this.toast().type]);

  onDismiss(): void {
    this.toastService.dismiss(this.toast().id);
  }

  getAriaLabel(): string {
    const { type, title, message } = this.toast();
    const typeLabel = TOAST_ARIA_LABEL_MAP[type];

    return message ? `${typeLabel}: ${title}, ${message}` : `${typeLabel}: ${title}`;
  }
}
