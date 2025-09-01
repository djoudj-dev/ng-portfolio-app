import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { AdminSidebar } from '@features/admin/components/admin-sidebar/admin-sidebar';
import { BadgeEditComponent } from '../components/badge-edit';
import { Badge } from '../models/badge.model';

@Component({
  selector: 'app-badge-edit-page',
  imports: [CommonModule, AdminSidebar, BadgeEditComponent],
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
              <h1 class="text-2xl font-bold text-text">Gestion des Badges</h1>
              <div class="flex space-x-3">
                <button
                  (click)="goBack()"
                  class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Retour
                </button>
                <button
                  (click)="logout()"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Badge Edit Content -->
        <main class="p-0">
          <app-badge-edit
            (save)="onBadgeSaved($event)"
            (cancelled)="onBadgeCancelled()"
          />
        </main>
      </div>
    </div>
  `,
})
export class BadgeEditPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

  /**
   * Déconnexion de l'utilisateur admin
   */
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

  /**
   * Gestion du toggle de la sidebar
   */
  onSidebarToggled(isOpen: boolean): void {
    this._sidebarOpen.set(isOpen);
  }

  /**
   * Retour vers la page d'accueil ou dashboard
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Handler quand un badge est sauvegardé
   */
  onBadgeSaved(badge: Badge): void {
    console.log('Badge sauvegardé:', badge);
    // Optionnellement, afficher une notification de succès
  }

  /**
   * Handler quand l'édition est annulée
   */
  onBadgeCancelled(): void {
    this.goBack();
  }
}
