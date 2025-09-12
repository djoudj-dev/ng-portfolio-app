import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { NAVIGATION_LINKS } from './data/navigation-links.data';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, NgOptimizedImage, RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background">
      <nav>
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-text">{{ currentPageTitle() }}</h1>

            <!-- Navigation Links -->
            <div class="flex items-center gap-2">
              @for (link of navigationLinks(); track link.route) {
                <a
                  [routerLink]="link.route === '' ? '/admin' : '/admin/' + link.route"
                  class="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:scale-105"
                  [class]="link.colorClasses"
                >
                  <img
                    [ngSrc]="link.icon"
                    [alt]="link.label"
                    width="16"
                    height="16"
                    class="w-4 h-4 flex-shrink-0 icon-invert"
                  />
                  <span class="hidden md:inline">{{ link.label }}</span>
                </a>
              }
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-6xl mx-auto px-3 sm:px-4">
        <header class="bg-background rounded-2xl mt-6 p-6 border border-accent shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <img
                  [ngSrc]="'/icons/navigation.svg'"
                  alt="Navigation"
                  width="16"
                  height="16"
                  class="w-8 h-8 flex-shrink-0 icon-invert"
                />
              </div>
              <h2 class="text-xl font-semibold text-text">Navigation</h2>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (link of navigationLinks(); track link.route) {
              <button
                class="flex items-center gap-2 px-4 py-3 text-sm font-medium border rounded-lg hover:scale-105"
                [class]="link.colorClasses"
                (click)="navigateToSection(link.route)"
              >
                <img
                  [ngSrc]="link.icon"
                  [alt]="link.label"
                  width="16"
                  height="16"
                  class="w-4 h-4 flex-shrink-0 icon-invert"
                />
                {{ link.label }}
              </button>
            }
          </div>
        </header>

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

  readonly stats = signal({
    users: 1,
    projects: 5,
    visitors: 124,
  });

  readonly navigationLinks = signal(NAVIGATION_LINKS);
  readonly currentUser = this.authService.user;

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

  navigateToSection(section: string): void {
    if (section === '') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate([`/admin/${section}`]);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Redirect to home page after successful logout
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion:', error);
      },
    });
  }
}
