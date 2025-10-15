import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
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
        (keydown)="onKeyDown($event)"
      >
        <div class="fixed inset-0 bg-background/80 bg-opacity-100 transition-opacity"></div>

        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            id="login-modal"
            class="relative transform overflow-hidden rounded-2xl bg-background shadow-xl transition-all border border-accent"
            (click)="$event.stopPropagation()"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabindex="-1"
          >
            <button
              type="button"
              class="absolute right-4 top-4 z-10 p-1 flex items-center justify-center text-text rounded hover:bg-accent transition-colors duration-200"
              (click)="closeModal()"
              aria-label="Fermer la modal"
              tabindex="0"
            >
              <app-svg-icon
                name="lucide:circle-x"
                [width]="'24'"
                [height]="'24'"
                [iconClass]="'w-6 h-6'"
              />
            </button>

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

  private _previouslyFocused: HTMLElement | null = null;

  readonly modalClosed = output<void>();
  readonly loginCompleted = output<void>();

  show(): void {
    this._previouslyFocused = (document.activeElement as HTMLElement) ?? null;
    this._isVisible.set(true);
    document.body.classList.add('overflow-hidden');
    document.body.classList.add('blur-bg');

    setTimeout(() => {
      const modal = document.getElementById('login-modal');
      modal?.focus();
      this.focusFirstInteractive(modal as HTMLElement | null);
    }, 0);
  }

  hide(): void {
    this._isVisible.set(false);
    document.body.classList.remove('overflow-hidden');
    document.body.classList.remove('blur-bg');
    // Restore focus to the element that opened the modal
    const toFocus = this._previouslyFocused;
    this._previouslyFocused = null;
    if (toFocus && typeof toFocus.focus === 'function') {
      setTimeout(() => toFocus.focus(), 0);
    }
  }

  private getFocusableElements(root?: HTMLElement | null): HTMLElement[] {
    const container = root ?? (document.getElementById('login-modal') as HTMLElement | null);
    if (!container) return [];
    const selectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    const nodeList = container.querySelectorAll<HTMLElement>(selectors.join(','));
    return Array.from(nodeList).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
    );
  }

  private focusFirstInteractive(root?: HTMLElement | null): void {
    const focusables = this.getFocusableElements(root);
    const target =
      focusables.find(
        (el) => el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'button',
      ) ?? focusables[0];
    target?.focus();
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
      return;
    }

    if (event.key === 'Tab') {
      const focusables = this.getFocusableElements();
      if (focusables.length === 0) {
        event.preventDefault();
        (document.getElementById('login-modal') as HTMLElement | null)?.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey) {
        if (!active || active === first) {
          last.focus();
          event.preventDefault();
        }
      } else {
        if (!active || active === last) {
          first.focus();
          event.preventDefault();
        }
      }
    }
  }
}
