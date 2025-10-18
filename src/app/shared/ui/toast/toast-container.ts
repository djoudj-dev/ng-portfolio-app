import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast } from '@shared/ui';
import { ToastService } from '@shared/ui';
import { ToastPosition } from './directives/toast-position';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, Toast, ToastPosition],
  template: `
    @if (toastService.hasToasts()) {
      <div
        class="fixed z-50 pointer-events-none"
        appToastPosition
        aria-live="polite"
        aria-label="Notifications"
      >
        <div class="flex pointer-events-auto">
          @for (toast of toastService.toasts(); track toast.id) {
            <app-toast [toast]="toast" />
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
}
