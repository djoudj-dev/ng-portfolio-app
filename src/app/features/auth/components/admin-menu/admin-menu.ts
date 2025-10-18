import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-admin-menu',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isLoggedIn()) {
      <!-- Bouton Menu Flottant -->
      <button
        type="button"
        (click)="toggleMenu()"
        class="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-background text-text shadow-lg shadow-primary/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        [attr.aria-label]="isMenuOpen() ? 'Fermer le menu admin' : 'Ouvrir le menu admin'"
        [attr.aria-expanded]="isMenuOpen()"
      >
        <app-svg-icon
          [name]="isMenuOpen() ? 'lucide:circle-x' : 'lucide:menu'"
          [width]="'24'"
          [height]="'24'"
          [iconClass]="'w-6 h-6 transition-transform duration-300'"
          [class.rotate-90]="isMenuOpen()"
        />
      </button>

      <!-- Menu Déroulant -->
      @if (isMenuOpen()) {
        <div
          class="fixed bottom-24 right-6 z-40 flex flex-col gap-2 rounded-2xl border-2 border-primary bg-background p-3 shadow-xl shadow-primary/20 backdrop-blur-md animate-slideUp min-w-[200px]"
          [class.hidden]="!isMenuOpen()"
        >
          @if (isAdmin()) {
            <!-- Bouton Admin/Dashboard -->
            <button
              type="button"
              (click)="navigateToAdmin()"
              class="group flex items-center gap-3 rounded-xl px-4 py-3 text-text transition-all duration-200 hover:bg-primary hover:text-background"
              aria-label="Accéder au panneau d'administration"
            >
              <app-svg-icon
                name="lucide:shield-user"
                [width]="'20'"
                [height]="'20'"
                [iconClass]="'w-5 h-5'"
              />
              <span class="text-sm font-medium">Administration</span>
            </button>
          }

          <!-- Séparateur -->
          @if (isAdmin()) {
            <div class="h-px bg-primary/20"></div>
          }

          <!-- Bouton Logout -->
          <button
            type="button"
            (click)="logout()"
            class="group flex items-center gap-3 rounded-xl px-4 py-3 text-text transition-all duration-200 hover:bg-red-500 hover:text-white"
            aria-label="Se déconnecter"
          >
            <app-svg-icon
              name="lucide:log-out"
              [width]="'20'"
              [height]="'20'"
              [iconClass]="'w-5 h-5'"
            />
            <span class="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      }
    }
  `,
  styles: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slideUp {
      animation: slideUp 0.2s ease-out;
    }
  `,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AdminMenuComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  protected readonly isMenuOpen = signal(false);
  protected readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  protected readonly isAdmin = computed(() => this.authService.isAdmin());

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  onDocumentClick(event: Event): void {
    if (!this.isMenuOpen()) {
      return;
    }

    const host = this.hostRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.isMenuOpen.set(false);
    }
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isMenuOpen.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur de déconnexion:', error);
      },
    });
  }
}
