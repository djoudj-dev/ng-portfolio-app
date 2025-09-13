import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@shared/ui';

export interface ConfirmModalData {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule, ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-background rounded-2xl border border-accent shadow-2xl max-w-md w-full animate-in fade-in-0 zoom-in-95 duration-200"
        (click)="$event.stopPropagation()"
        (keydown)="onKeyDown($event)"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
        [attr.aria-describedby]="data().message ? 'confirm-message' : null"
        tabindex="-1"
        #modalRef
      >
        <div class="p-6 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              [ngClass]="getIconContainerClass()"
            >
              @switch (data().type) {
                @case ('danger') {
                  <img
                    [ngSrc]="'icons/error.svg'"
                    alt="Error"
                    class="w-5 h-5"
                    [ngClass]="getIconClass()"
                    fill
                  />
                }
                @case ('warning') {
                  <img
                    [ngSrc]="'icons/warning.svg'"
                    alt="Warning"
                    class="w-5 h-5"
                    [ngClass]="getIconClass()"
                    fill
                  />
                }
                @default {
                  <svg
                    class="w-5 h-5"
                    [ngClass]="getIconClass()"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              }
            </div>

            <h2 id="confirm-title" class="text-lg font-semibold text-text">
              {{ data().title }}
            </h2>
          </div>
        </div>

        @if (data().message) {
          <div class="px-6 pb-6">
            <p id="confirm-message" class="text-secondary leading-relaxed">
              {{ data().message }}
            </p>
          </div>
        }

        <div class="flex gap-3 p-6 pt-4 border-t border-accent/20">
          <app-button class="flex-1" color="accent" (buttonClick)="onCancel()">
            {{ data().cancelText || 'Annuler' }}
          </app-button>

          <app-button class="flex-1" [color]="getConfirmButtonColor()" (buttonClick)="onConfirm()">
            {{ data().confirmText || 'Confirmer' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes animate-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .animate-in {
        animation: animate-in 0.2s ease-out;
      }

      .fade-in-0 {
        animation-fill-mode: forwards;
      }

      .zoom-in-95 {
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
    `,
  ],
})
export class ConfirmModal implements AfterViewInit {
  @ViewChild('modalRef', { static: false }) modalRef!: ElementRef;

  readonly data = input.required<ConfirmModalData>();

  readonly confirmed = output<boolean>();
  readonly cancelled = output<void>();

  ngAfterViewInit(): void {
    // Focus the modal on init
    setTimeout(() => {
      this.modalRef?.nativeElement?.focus();
      this.focusFirstInteractive();
    }, 0);
  }

  private getFocusableElements(): HTMLElement[] {
    const root: HTMLElement | null = this.modalRef?.nativeElement ?? null;
    if (!root) return [];
    const selectors = [
      'a[href]','area[href]','input:not([disabled])','select:not([disabled])','textarea:not([disabled])',
      'button:not([disabled])','iframe','object','embed','[contenteditable]','[tabindex]:not([tabindex="-1"])'
    ];
    const nodeList = root.querySelectorAll<HTMLElement>(selectors.join(','));
    return Array.from(nodeList).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  }

  private focusFirstInteractive(): void {
    const focusables = this.getFocusableElements();
    // Prefer the first button after heading
    const target = focusables.find((el) => el.tagName.toLowerCase() === 'button') ?? focusables[0];
    target?.focus();
  }

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

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.onCancel();
      return;
    }

    if (event.key === 'Tab') {
      const focusables = this.getFocusableElements();
      if (focusables.length === 0) {
        event.preventDefault();
        (this.modalRef?.nativeElement as HTMLElement)?.focus();
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

  getIconContainerClass(): string {
    switch (this.data().type) {
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  getIconClass(): string {
    switch (this.data().type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  }

  getConfirmButtonColor(): 'primary' | 'secondary' | 'accent' | 'red' {
    switch (this.data().type) {
      case 'danger':
        return 'red';
      case 'warning':
        return 'accent';
      default:
        return 'primary';
    }
  }
}
