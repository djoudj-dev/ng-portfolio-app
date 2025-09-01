import { Component, ChangeDetectionStrategy, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { AdminSidebar } from '@features/admin/components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-badge-admin-layout',
  imports: [CommonModule, AdminSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background flex">
      <!-- Sidebar -->
      <app-admin-sidebar
        [userEmail]="currentUser()?.email || ''"
        (sidebarToggled)="onSidebarToggled($event)"
      />

      <!-- Main Content -->
      <div [class]="mainContentClasses()" class="flex-1 transition-all duration-300 ease-in-out">
        <!-- Header -->
        <header class="bg-background border-b border-accent">
          <div class="px-6 py-4">
            <div class="flex justify-between items-center">
              <h1 class="text-2xl font-bold text-text">{{ pageTitle() }}</h1>
              <div class="flex space-x-3">
                @if (showBackButton()) {
                  <button
                    (click)="goBack()"
                    class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {{ backButtonText() }}
                  </button>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="p-0">
          <ng-content />
        </main>
      </div>
    </div>
  `,
})
export class BadgeAdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Inputs pour personnaliser le layout
  readonly pageTitle = input<string>('Gestion des Badges');
  readonly showBackButton = input<boolean>(true);
  readonly backButtonText = input<string>('Retour');

  // Sidebar state
  private readonly _sidebarOpen = signal(true);

  // Computed pour l'utilisateur actuel
  readonly currentUser = this.authService.user;

  // Computed pour les classes du contenu principal
  readonly mainContentClasses = computed(() => {
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {
      return 'ml-0';
    }
    return this._sidebarOpen() ? 'ml-64' : 'ml-16';
  });

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
      },
    });
  }

  onSidebarToggled(isOpen: boolean): void {
    this._sidebarOpen.set(isOpen);
  }

  goBack(): void {
    this.router.navigate(['/admin/badges']);
  }
}
