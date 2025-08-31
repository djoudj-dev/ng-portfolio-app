import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import type { ToastData } from '@shared/ui';
import { ToastService } from '@shared/ui';

@Component({
  selector: 'app-toast',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div
      [class]="toastClasses()"
      class="flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 animate-slide-in-right"
      role="alert"
      [attr.aria-live]="toast().type === 'danger' ? 'assertive' : 'polite'"
    >
      <!-- Icône -->
      <div class="flex-shrink-0 mr-3">
        @switch (toast().type) {
          @case ('success') {
            <img
              [ngSrc]="'/icons/toast/success.svg'"
              alt="Success"
              class="w-5 h-5"
              [class]="iconClasses()"
              height="24"
              width="24"
            />
          }
          @case ('warning') {
            <img
              [ngSrc]="'/icons/toast/warning.svg'"
              alt="Warning"
              class="w-5 h-5"
              [class]="iconClasses()"
              height="24"
              width="24"
            />
          }
          @case ('danger') {
            <img
              [ngSrc]="'/icons/toast/error.svg'"
              alt="Error"
              class="w-5 h-5"
              [class]="iconClasses()"
              height="24"
              width="24"
            />
          }
        }
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-semibold mb-1" [class]="titleClasses()">
          {{ toast().title }}
        </h4>
        @if (toast().message) {
          <p class="text-sm" [class]="messageClasses()">
            {{ toast().message }}
          </p>
        }
      </div>

      <!-- Bouton de fermeture -->
      @if (toast().dismissible) {
        <button
          type="button"
          (click)="onDismiss()"
          class="ml-3 flex-shrink-0 p-1 rounded-full hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          [class]="dismissButtonClasses()"
          aria-label="Fermer la notification"
        >
          <img
            [ngSrc]="'/icons/toast/close.svg'"
            alt="Fermer"
            class="w-4 h-4"
            height="16"
            width="16"
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
      animation: slide-in-right 0.3s ease-out;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly toastService = inject(ToastService);

  readonly toast = input.required<ToastData>();
  readonly dismissed = output<string>();

  readonly toastClasses = computed(() => {
    const type = this.toast().type;
    const baseClasses = 'transition-all duration-300';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-background border-green-400`;
      case 'warning':
        return `${baseClasses} bg-background border-accent-400`;
      case 'danger':
        return `${baseClasses} bg-background border-red-400`;
      default:
        return baseClasses;
    }
  });

  readonly iconClasses = computed(() => {
    const type = this.toast().type;

    switch (type) {
      case 'success':
        return 'text-green';
      case 'warning':
        return 'text-accent';
      case 'danger':
        return 'text-red';
      default:
        return 'text-text';
    }
  });

  readonly titleClasses = computed(() => {
    const type = this.toast().type;

    switch (type) {
      case 'success':
        return 'text-green';
      case 'warning':
        return 'text-accent';
      case 'danger':
        return 'text-red';
      default:
        return 'text-text';
    }
  });

  readonly messageClasses = computed(() => {
    const type = this.toast().type;

    switch (type) {
      case 'success':
        return 'text-green';
      case 'warning':
        return 'text-accent';
      case 'danger':
        return 'text-red';
      default:
        return 'text-text';
    }
  });

  readonly dismissButtonClasses = computed(() => {
    const type = this.toast().type;

    switch (type) {
      case 'success':
        return 'text-green hover:text-green-800 focus:ring-green-500';
      case 'warning':
        return 'text-accent hover:text-accent-800 focus:ring-accent-500';
      case 'danger':
        return 'text-red hover:text-red-800 focus:ring-red-500';
      default:
        return 'text-secondary hover:text-secondary-800 focus:ring-secondary-500';
    }
  });

  onDismiss(): void {
    this.dismissed.emit(this.toast().id);
    this.toastService.dismiss(this.toast().id);
  }
}
