import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { LoginForm } from '@shared/ui/login/login-form/login-form';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-login-modal',
  imports: [LoginForm, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isVisible()) {
      <div
        class="fixed inset-0 z-50 overflow-y-auto"
        (click)="onOverlayClick($event)"
        (keydown)="onKeyDown($event)"
      >
        <div class="fixed inset-0 bg-background bg-opacity-75 transition-opacity"></div>

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
            <img
              [ngSrc]="'icons/close.svg'"
              alt="Fermer"
              width="16"
              height="16"
              class="absolute right-4 top-4 z-10 h-4 w-4 cursor-pointer hover:opacity-70 transition-opacity"
              (click)="closeModal()"
              [attr.aria-label]="'Fermer la modal'"
            />

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
  private readonly _isVisible = signal(false);
  readonly isVisible = this._isVisible.asReadonly();

  readonly modalClosed = output<void>();
  readonly loginCompleted = output<void>();

  show(): void {
    this._isVisible.set(true);
    document.body.classList.add('overflow-hidden');

    setTimeout(() => {
      const modal = document.getElementById('login-modal');
      modal?.focus();
    }, 0);
  }

  hide(): void {
    this._isVisible.set(false);
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
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
