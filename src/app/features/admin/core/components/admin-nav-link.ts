import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import type { NavigationLink } from '@features/admin';

/**
 * Composant réutilisable pour les liens de navigation admin
 * Optimisé pour Angular 20+ avec les nouveaux inputs signals
 */
@Component({
  selector: 'app-admin-nav-link',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="routeLink()"
      routerLinkActive="bg-primary/10 border-primary"
      class="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:scale-105 transition-all duration-200"
      [class]="link().colorClasses"
      [attr.aria-label]="link().label"
    >
      <img
        [ngSrc]="link().icon"
        [alt]="link().label"
        width="16"
        height="16"
        class="w-4 h-4 flex-shrink-0 icon-invert"
      />
      @if (showLabel()) {
        <span class="hidden md:inline">{{ link().label }}</span>
      }
    </a>
  `,
})
export class AdminNavLink {
  /** Lien de navigation à afficher */
  readonly link = input.required<NavigationLink>();

  /** Afficher le label ou non */
  readonly showLabel = input<boolean>(true);

  /**
   * Génère le lien de route complet
   */
  protected readonly routeLink = input.required<string>();
}
