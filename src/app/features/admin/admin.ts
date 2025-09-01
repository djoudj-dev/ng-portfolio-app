import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, AdminSidebar, RouterOutlet],
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
        <header class="bg-background">
          <div class="px-6 py-4">
            <div class="flex justify-between items-center">
              <h1 class="text-2xl font-bold text-text">{{ currentPageTitle() }}</h1>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class Admin {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // État local avec signaux
  readonly stats = signal({
    users: 1,
    projects: 5,
    visitors: 124,
  });

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

  // Computed pour le titre de la page actuelle
  readonly currentPageTitle = computed(() => {
    const url = this.router.url;
    if (url === '/admin' || url === '/admin/') return 'Dashboard';
    if (url.includes('/admin/badges')) return 'Gestion des badges';
    if (url.includes('/admin/users')) return 'Gestion des utilisateurs';
    if (url.includes('/admin/projects')) return 'Gestion des projets';
    if (url.includes('/admin/skills')) return 'Gestion des compétences';
    if (url.includes('/admin/settings')) return 'Paramètres';
    return 'Administration';
  });

  /**
   * Déconnexion de l'utilisateur admin
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Redirect to home page after successful logout
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
}
