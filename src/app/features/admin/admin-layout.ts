import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AdminSidebar } from '@features/admin/core';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, AdminSidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background">
      <!-- Sidebar de navigation -->
      <app-admin-sidebar />

      <!-- Main Content avec offset pour le sidebar -->
      <div class="lg:ml-64 transition-all duration-300">
        <!-- Header avec titre de page -->
        <header
          class="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-accent/20 shadow-md"
        >
          <div class="px-6 py-4 lg:px-8">
            <div class="flex items-center justify-between">
              <div>
                <h1
                  class="text-text decoration-accent text-2xl font-bold underline decoration-2 underline-offset-4 lg:text-3xl"
                >
                  {{ currentPageTitle() }}
                </h1>
                <p class="text-text/80 text-sm mt-2">{{ currentPageDescription() }}</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content Area -->
        <main class="min-h-[calc(100vh-8rem)] p-6 lg:p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet />
          </div>
        </main>

        <!-- Footer (optionnel) -->
        <footer class="border-t border-primary/20 bg-background/80 backdrop-blur-sm shadow-lg mt-8">
          <div class="px-6 py-4 lg:px-8">
            <p class="text-xs text-text/60 text-center font-medium">
              © {{ currentYear }} Dashboard Admin · Tous droits réservés
            </p>
          </div>
        </footer>
      </div>
    </div>
  `,
})
export class AdminLayout {
  private readonly router = inject(Router);

  // Année actuelle pour le footer
  protected readonly currentYear = new Date().getFullYear();

  // Map des routes vers les titres et descriptions
  private readonly routeMetadata = new Map<
    string,
    { title: string; description: string }
  >([
    ['/admin', { title: 'Dashboard', description: 'Vue d\'ensemble de votre administration' }],
    ['/admin/', { title: 'Dashboard', description: 'Vue d\'ensemble de votre administration' }],
    [
      '/admin/badges',
      { title: 'Gestion des badges', description: 'Configurer votre statut de disponibilité' },
    ],
    [
      '/admin/messages',
      {
        title: 'Gestion des messages',
        description: 'Consulter et répondre aux messages reçus',
      },
    ],
    ['/admin/cv', { title: 'Gestion du CV', description: 'Télécharger et mettre à jour votre CV' }],
    [
      '/admin/analytics',
      { title: 'Analytiques', description: 'Statistiques et métriques de votre portfolio' },
    ],
    [
      '/admin/projects',
      { title: 'Gestion des projets', description: 'Créer et modifier vos projets' },
    ],
    ['/admin/settings', { title: 'Paramètres', description: 'Configuration de votre compte' }],
  ]);

  // Signal réactif basé sur les événements de navigation
  private readonly currentUrl = toSignal(
    this.router.events.pipe(map(() => this.router.url)),
    { initialValue: this.router.url },
  );

  /**
   * Computed optimisé pour le titre de page avec Map lookup O(1)
   */
  readonly currentPageTitle = computed(() => {
    const url = this.currentUrl();

    // Recherche exacte d'abord (O(1))
    if (this.routeMetadata.has(url)) {
      return this.routeMetadata.get(url)!.title;
    }

    // Recherche par startsWith pour les routes dynamiques
    for (const [route, metadata] of this.routeMetadata) {
      if (url.startsWith(route) && route !== '/admin' && route !== '/admin/') {
        return metadata.title;
      }
    }

    return 'Administration';
  });

  /**
   * Computed pour la description de page
   */
  readonly currentPageDescription = computed(() => {
    const url = this.currentUrl();

    if (this.routeMetadata.has(url)) {
      return this.routeMetadata.get(url)!.description;
    }

    for (const [route, metadata] of this.routeMetadata) {
      if (url.startsWith(route) && route !== '/admin' && route !== '/admin/') {
        return metadata.description;
      }
    }

    return 'Gérez votre portfolio professionnel';
  });
}
