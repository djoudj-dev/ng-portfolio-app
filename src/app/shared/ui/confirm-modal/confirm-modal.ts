import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { ButtonComponent } from '@shared/ui';
import { SvgIcon } from '../icon-svg/icon-svg';

export interface ConfirmModalData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-modal',
  imports: [ButtonComponent, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onCancel()"
    >
      <div
        class="bg-background rounded-2xl border border-accent shadow-2xl max-w-md w-full animate-modal"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
        [attr.aria-describedby]="data().message ? 'confirm-message' : null"
      >
        <!-- Header avec icône -->
        <div class="p-6 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              [class]="iconContainerClass()"
            >
              <app-svg-icon
                [name]="iconName()"
                [width]="'20'"
                [height]="'20'"
                [class]="iconClass()"
              />
            </div>

            <h2 id="confirm-title" class="text-lg font-semibold text-text">
              {{ data().title }}
            </h2>
          </div>
        </div>

        <!-- Message -->
        @if (data().message) {
          <div class="px-6 pb-6">
            <p id="confirm-message" class="text-secondary leading-relaxed">
              {{ data().message }}
            </p>
          </div>
        }

        <!-- Actions -->
        <div class="flex gap-3 p-6 pt-4 border-t border-accent/20">
          <app-button class="flex-1" color="accent" (buttonClick)="onCancel()">
            {{ data().cancelText || 'Annuler' }}
          </app-button>

          <app-button class="flex-1" [color]="confirmButtonColor()" (buttonClick)="onConfirm()">
            {{ data().confirmText || 'Confirmer' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .animate-modal {
      animation: modal-in 0.2s ease-out;
    }

    @keyframes modal-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,
})
export class ConfirmModal {
  readonly data = input.required<ConfirmModalData>();

  readonly confirmed = output<boolean>();
  readonly cancelled = output<void>();

  readonly iconName = computed(() => {
    const type = this.data().type;
    switch (type) {
      case 'danger':
        return 'lucide:circle-x';
      case 'warning':
        return 'lucide:triangle-alert';
      default:
        return 'lucide:info';
    }
  });

  readonly iconContainerClass = computed(() => {
    const type = this.data().type;
    switch (type) {
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  });

  readonly iconClass = computed(() => {
    const type = this.data().type;
    switch (type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  });

  readonly confirmButtonColor = computed((): 'primary' | 'secondary' | 'accent' | 'red' => {
    const type = this.data().type;
    switch (type) {
      case 'danger':
        return 'red';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  });

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.confirmed.emit(false);
    this.cancelled.emit();
  }

  onBackdropClick(_event: Event): void {
    this.onCancel();
  }
}
