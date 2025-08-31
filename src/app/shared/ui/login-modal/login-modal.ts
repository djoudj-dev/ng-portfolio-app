import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { LoginForm } from '@shared/ui/login-form/login-form';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login-modal',
  imports: [LoginForm, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <!-- Modal Overlay -->
      <div
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onOverlayClick($event)"
        (keydown)="onKeyDown($event)"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-background bg-opacity-75 transition-opacity"></div>

        <!-- Modal Content -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            id="login-modal"
            class="relative transform overflow-hidden rounded-lg bg-background shadow-xl transition-all"
            (click)="$event.stopPropagation()"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabindex="-1"
          >
            <!-- Close Button -->
            <button
              type="button"
              (click)="closeModal()"
              class="absolute right-4 top-4 z-10 rounded-full p-2 text-secondary hover:text-text hover:bg-primary-100 transition-colors"
              aria-label="Fermer la modal"
            >
              <img
                [ngSrc]="'/icons/login/close.svg'"
                alt="Fermer"
                width="16"
                height="16"
                class="h-4 w-4"
              />
            </button>

            <!-- Login Form -->
            <app-login-form (loginSuccess)="onLoginSuccess()" (loginCancel)="onLoginCancel()" />
          </div>
        </div>
      </div>
    }
  `,
  host: {
    '[class.login-modal]': 'true',
  },
})
export class LoginModal {
  // State management
  private readonly _isVisible = signal(false);
  readonly isVisible = this._isVisible.asReadonly();

  // Events
  readonly modalClosed = output<void>();
  readonly loginCompleted = output<void>();

  show(): void {
    this._isVisible.set(true);
    // Prevent body scroll when modal is open
    document.body.classList.add('overflow-hidden');

    // Focus the modal for accessibility
    setTimeout(() => {
      const modal = document.getElementById('login-modal');
      modal?.focus();
    }, 0);
  }

  hide(): void {
    this._isVisible.set(false);
    // Restore body scroll
    document.body.classList.remove('overflow-hidden');
  }

  closeModal(): void {
    this.hide();
    this.modalClosed.emit();
  }

  onLoginSuccess(): void {
    this.hide();
    this.loginCompleted.emit();
  }

  onLoginCancel(): void {
    this.closeModal();
  }

  onOverlayClick(event: Event): void {
    // Close modal when clicking on overlay (not on modal content)
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    // Close modal when pressing ESC key
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
