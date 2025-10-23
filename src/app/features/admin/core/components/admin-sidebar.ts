import { Component, ChangeDetectionStrategy, signal, computed, inject, effect, DestroyRef } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { NAVIGATION_LINKS } from '@features/admin';
import type { NavigationLink } from '@features/admin';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-admin-sidebar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Mobile Toggle Button -->
    <button
      (click)="toggleSidebar()"
      class="lg:hidden fixed top-4 left-4 z-50 p-3 bg-background rounded-xl shadow-lg shadow-primary/20 border border-primary/40 hover:scale-110 transition-all backdrop-blur"
      [attr.aria-label]="isOpen() ? 'Fermer le menu' : 'Ouvrir le menu'"
      [attr.aria-expanded]="isOpen()"
    >
      <app-svg-icon
        [name]="isOpen() ? 'lucide:circle-x' : 'lucide:menu'"
        width="24"
        height="24"
        class="w-6 h-6 icon-invert"
      />
    </button>

    <!-- Overlay pour mobile -->
    @if (isOpen() && isMobile()) {
      <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        (click)="closeSidebar()"
        [@fadeIn]
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-0 left-0 h-screen bg-background border-r border-primary/40 shadow-lg shadow-primary/20 backdrop-blur z-40 transition-all duration-300 ease-in-out"
      [class.translate-x-0]="isOpen() || !isMobile()"
      [class.-translate-x-full]="!isOpen() && isMobile()"
      [class.w-64]="isExpanded()"
      [class.w-20]="!isExpanded()"
      [attr.aria-hidden]="!isOpen() && isMobile()"
    >
      <div class="flex flex-col h-full">
        <!-- Header avec toggle expand/collapse (desktop uniquement) -->
        <div class="hidden lg:flex items-center justify-between p-4 border-b border-primary/20">
          @if (isExpanded()) {
            <h2 class="text-lg font-bold text-text">Navigation</h2>
          }
          <button
            (click)="toggleExpanded()"
            class="p-2 hover:bg-primary/10 rounded-lg transition-all duration-200 hover:scale-110"
            [attr.aria-label]="isExpanded() ? 'Réduire le menu' : 'Étendre le menu'"
          >
            <app-svg-icon
              [name]="isExpanded() ? 'lucide:arrow-big-left' : 'lucide:arrow-big-right'"
              width="20"
              height="20"
              class="w-5 h-5 text-primary"
            />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 scrollbar-thin">
          <ul class="space-y-2" role="list">
            @for (link of navigationLinks; track link.route) {
              <li>
                <a
                  [routerLink]="getRouteLink(link.route)"
                  routerLinkActive="bg-primary/20 border-l-4 border-l-primary text-primary font-semibold shadow-sm"
                  class="flex items-center gap-3 px-3 py-3 rounded-lg text-text hover:bg-primary/10 hover:border-l-2 hover:border-l-primary/40 transition-all duration-200 group relative"
                  [class.justify-center]="!isExpanded()"
                  [attr.aria-label]="link.label"
                >
                  <!-- Icon -->
                  <div
                    class="flex-shrink-0 w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <app-svg-icon
                      [name]="link.icon"
                      width="24"
                      height="24"
                      class="w-6 h-6 icon-invert"
                    />
                  </div>

                  <!-- Label -->
                  @if (isExpanded()) {
                    <span class="flex-1 text-sm">{{ link.label }}</span>
                  } @else {
                    <!-- Tooltip pour mode réduit -->
                    <span
                      class="absolute left-full ml-2 px-3 py-1.5 bg-accent text-text text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg"
                    >
                      {{ link.label }}
                    </span>
                  }

                  <!-- Badge count (optionnel) -->
                  @if (getBadgeCount(link.route); as count) {
                    <span
                      class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white"
                      [class.absolute]="!isExpanded()"
                      [class.top-1]="!isExpanded()"
                      [class.right-1]="!isExpanded()"
                    >
                      {{ count }}
                    </span>
                  }
                </a>
              </li>
            }
          </ul>
        </nav>

        <!-- Footer avec user info -->
        <div
          class="p-4 border-t border-primary/20 bg-primary/5 backdrop-blur"
          [class.flex-col]="isExpanded()"
          [class.items-center]="!isExpanded()"
        >
          @if (isExpanded()) {
            <div class="flex items-center gap-3 mb-3">
              @if (avatarUrl) {
                <img
                  [ngSrc]="avatarUrl"
                  [alt]="displayName"
                  width="40"
                  height="40"
                  class="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
                />
              } @else {
                <div
                  class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30"
                >
                  <span class="text-sm font-bold text-primary">{{ userInitials() }}</span>
                </div>
              }
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-text truncate">{{ displayName }}</p>
                <p class="text-xs text-secondary truncate">{{ userEmail() }}</p>
              </div>
            </div>
            <button
              (click)="onLogout()"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10  rounded-lg hover:bg-red-500/20 transition-colors text-text text-sm font-medium"
            >
              <app-svg-icon
                name="lucide:log-out"
                class="w-4 h-4"
                width="24"
                height="24"
                />
              Déconnexion
            </button>
          } @else {
            <div class="flex flex-col items-center gap-3">
              @if (avatarUrl) {
                <img
                  [ngSrc]="avatarUrl"
                  [alt]="displayName"
                  width="32"
                  height="32"
                  class="w-8 h-8 rounded-full object-cover border-2 border-primary/30"
                />
              } @else {
                <div
                  class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30"
                >
                  <span class="text-xs font-bold text-primary">{{ userInitials() }}</span>
                </div>
              }
              <button
                (click)="onLogout()"
                class="p-2 text-text hover:bg-red-500/10 rounded-lg transition-colors group"
                [attr.aria-label]="'Déconnexion'"
              >
                <app-svg-icon
                  name="lucide:log-out"
                  class="w-6 h-6 group-hover:scale-110 transition-transform"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class AdminSidebar {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  // État du sidebar
  readonly isOpen = signal(false);
  readonly isExpanded = signal(true);
  readonly isMobile = signal(false);

  // Navigation links
  protected readonly navigationLinks: ReadonlyArray<NavigationLink> = NAVIGATION_LINKS;

  // Informations utilisateur
  readonly currentUser = this.authService.user;
  readonly displayName = 'Julien NÉDELLEC';
  readonly avatarUrl = '/photoProfil.webp';

  // Email utilisateur depuis AuthService
  readonly userEmail = computed(() => {
    return this.currentUser()?.email ?? 'admin@example.com';
  });

  // Initiales de l'utilisateur pour l'avatar par défaut
  readonly userInitials = computed(() => {
    const name = this.displayName;
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  constructor() {
    // Initialiser la détection mobile
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 1024);

      // ResizeObserver pour détecter les changements de taille
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          this.isMobile.set(width < 1024);
        }
      });

      resizeObserver.observe(document.body);

      // Cleanup automatique avec DestroyRef
      this.destroyRef.onDestroy(() => {
        resizeObserver.disconnect();
      });
    }

    // Fermer automatiquement le sidebar mobile lors d'un changement de route
    effect(() => {
      if (this.isMobile() && this.isOpen()) {
        // Permet de fermer le sidebar après navigation
        this.isOpen.set(false);
      }
    });
  }

  /**
   * Toggle l'ouverture du sidebar (mobile)
   */
  toggleSidebar(): void {
    this.isOpen.update((open) => !open);
  }

  /**
   * Ferme le sidebar (mobile)
   */
  closeSidebar(): void {
    this.isOpen.set(false);
  }

  /**
   * Toggle l'expansion du sidebar (desktop)
   */
  toggleExpanded(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  /**
   * Génère le lien de route complet
   */
  protected getRouteLink(route: string): string {
    return route === '' ? '/admin' : `/admin/${route}`;
  }

  /**
   * Retourne le nombre de badges pour une route (ex: messages non lus)
   * À implémenter selon vos besoins
   */
  protected getBadgeCount(route: string): number | null {
    // Exemple: afficher le nombre de messages non lus
    if (route === 'messages') {
      // À connecter avec votre service de messages
      return null; // ou le nombre réel
    }
    return null;
  }

  /**
   * Gère la déconnexion
   */
  protected onLogout(): void {
    // À implémenter selon votre logique de déconnexion
    console.log('Logout clicked');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
