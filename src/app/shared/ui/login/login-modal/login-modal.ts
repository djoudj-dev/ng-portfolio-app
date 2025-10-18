import { Component, ChangeDetectionStrategy, signal, output, effect } from '@angular/core';
import { LoginForm } from '@shared/ui/login/login-form/login-form';
import { SvgIcon } from '../../icon-svg/icon-svg';

@Component({
  selector: 'app-login-modal',
  imports: [LoginForm, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onOverlayClick($event)"
        (keydown.escape)="closeModal()"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-background/80 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="modal-content"
            (click)="$event.stopPropagation()"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <!-- Close Button -->
            <button
              type="button"
              class="modal-close-btn"
              (click)="closeModal()"
              aria-label="Fermer"
            >
              <app-svg-icon name="lucide:circle-x" [width]="'24'" [height]="'24'" />
            </button>

            <!-- Form -->
            <app-login-form (loginSuccess)="onLoginSuccess()" (loginCancel)="closeModal()" />
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal-content {
      @apply relative transform overflow-hidden rounded-2xl bg-background
             shadow-xl transition-all border border-accent;
    }

    .modal-close-btn {
      @apply absolute right-4 top-4 z-10 p-1 flex items-center justify-center
             text-text rounded hover:bg-accent transition-colors;
    }
  `,
})
export class LoginModal {
  private readonly _isVisible = signal(false);
  readonly isVisible = this._isVisible.asReadonly();

  readonly modalClosed = output<void>();
  readonly loginCompleted = output<void>();

  constructor() {
    effect(() => {
      if (this._isVisible()) {
        document.body.classList.add('overflow-hidden', 'blur-bg');
      } else {
        document.body.classList.remove('overflow-hidden', 'blur-bg');
      }
    });
  }

  show(): void {
    this._isVisible.set(true);
  }

  hide(): void {
    this._isVisible.set(false);
  }

  closeModal(): void {
    this.hide();
    this.modalClosed.emit();
  }

  onLoginSuccess(): void {
    this.hide();
    this.loginCompleted.emit();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
