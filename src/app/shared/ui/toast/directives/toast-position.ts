import { Directive, computed, inject } from '@angular/core';
import { ToastService } from '@shared/ui';

@Directive({
  selector: '[appToastPosition]',
  host: {
    '[class]': 'positionClasses() + " " + directionClasses()'
  },
})
export class ToastPosition {
  private readonly toastService = inject(ToastService);

  // Compute wrapper fixed positioning classes based on service config
  readonly positionClasses = computed(() => {
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

  // Compute flex direction for stacking order
  readonly directionClasses = computed(() => {
    const position = this.toastService.config().position ?? 'top-right';
    return position.startsWith('bottom') ? 'flex-col-reverse' : 'flex-col';
  });
}
