import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-badge-admin-layout',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background">
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
  `,
})
export class BadgeAdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Inputs pour personnaliser le layout
  readonly pageTitle = input<string>('Gestion des Badges');
  readonly showBackButton = input<boolean>(true);
  readonly backButtonText = input<string>('Retour');

  // Computed pour l'utilisateur actuel
  readonly currentUser = this.authService.user;

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

  goBack(): void {
    this.router.navigate(['/admin/badges']);
  }
}
