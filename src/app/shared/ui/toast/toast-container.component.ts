import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '@shared/ui';
import { ToastService } from '@shared/ui';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, ToastComponent],
  template: `
    @if (toastService.hasToasts()) {
      <div
        class="fixed z-50 pointer-events-none"
        [class]="containerPositionClasses()"
        aria-live="polite"
        aria-label="Notifications"
      >
        <div class="flex flex-col pointer-events-auto" [class]="containerDirectionClasses()">
          @for (toast of toastService.toasts(); track toast.id) {
            <app-toast [toast]="toast" (dismissed)="onToastDismissed($event)" />
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  readonly containerPositionClasses = computed(() => {
    const position = this.toastService.config().position ?? 'top-right';

    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  });

  readonly containerDirectionClasses = computed(() => {
    const position = this.toastService.config().position ?? 'top-right';

    // Les toasts en bas doivent apparaître dans l'ordre inverse (nouveaux en bas)
    if (position.startsWith('bottom')) {
      return 'flex-col-reverse';
    }

    return 'flex-col';
  });

  onToastDismissed(id: string): void {
    // Le toast se supprime déjà lui-même, cette méthode peut être utilisée
    // pour des actions supplémentaires si nécessaire
    console.log(`Toast ${id} dismissed`);
  }
}
