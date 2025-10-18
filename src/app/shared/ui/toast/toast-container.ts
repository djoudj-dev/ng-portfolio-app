import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Toast } from '@shared/ui';
import { ToastService } from '@shared/ui';

@Component({
  selector: 'app-toast-container',
  imports: [Toast],
  template: `
    @if (toastService.hasToasts()) {
      <div
        class="fixed top-4 right-4 z-50 flex flex-col pointer-events-auto"
        aria-live="polite"
        aria-label="Notifications"
      >
        @for (toast of toastService.toasts(); track toast.id) {
          <app-toast [toast]="toast" />
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  readonly toastService = inject(ToastService);
}
