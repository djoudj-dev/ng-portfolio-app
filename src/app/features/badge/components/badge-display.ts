import {
  Component,
  input,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Badge, BadgeStatus } from '../models/badge.model';
import { BadgeService } from '../services/badge-service';

@Component({
  selector: 'app-badge-display',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (currentBadge()) {
      <div
        class="items-center space-x-3 px-4 py-2 bg-background border border-accent rounded-lg shadow-lg flex justify-around cursor-pointer hover:bg-accent/20 transition-colors"
        (click)="onBadgeClick()"
      >
        <!-- Logo Angular -->
        <img
          [ngSrc]="'/icons/skills/angular.webp'"
          alt="Angular"
          class="w-12 h-12 rounded"
          height="860"
          width="860"
        />

        <!-- Texte "Développeur Angular" -->
        <span class="text-xl font-medium text-text"> Développeur Angular </span>

        <!-- Badge de statut avec dot -->
        <div
          class="inline-flex items-center space-x-2 px-2 py-1 rounded-full"
          [ngClass]="badgeClasses()"
        >
          <!-- Status dot -->
          <div class="relative">
            <div
              class="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              [ngClass]="dotClasses()"
            ></div>
            @if (currentBadge()!.status === badgeStatus.AVAILABLE_FROM) {
              <div
                class="absolute -top-1 -right-1 w-2 h-2 bg-background rounded-full animate-ping shadow-sm"
              ></div>
            }
          </div>

          <!-- Status text -->
          <span class="text-sm font-semibold" [ngClass]="textClasses()">
            {{ statusText() }}
          </span>
        </div>

        <!-- Info supplémentaire si disponible -->
        @if (availabilityInfo(); as info) {
          <span class="text-xs text-secondary ml-2">
            {{ info }}
          </span>
        }
      </div>
    } @else if (isLoading()) {
      <div
        class="inline-flex items-center space-x-3 px-4 py-2 bg-surface border border-accent rounded-lg shadow-lg"
      >
        <div class="w-6 h-6 bg-gray-300 rounded animate-ping"></div>
        <span class="text-sm text-secondary">Chargement...</span>
        <div class="w-16 h-6 bg-gray-300 rounded-full animate-ping"></div>
      </div>
    } @else {
      <div
        class="inline-flex items-center space-x-3 px-4 py-2 bg-surface border border-accent rounded-lg shadow-lg"
      >
        <img
          [ngSrc]="'/icons/skills/angular.webp'"
          alt="Angular"
          class="w-6 h-6 rounded opacity-50"
          height="860"
          width="860"
        />
        <span class="text-sm text-text">Développeur Angular</span>
        <div class="inline-flex items-center space-x-2 px-2 py-1 bg-background rounded-full">
          <div class="w-4 h-4 bg-background rounded-full border-2 border-accent shadow-sm"></div>
          <span class="text-sm font-semibold text-text">Indisponible</span>
        </div>
      </div>
    }
  `,
})
export class BadgeDisplayComponent implements OnInit {
  private readonly badgeService = inject(BadgeService);
  private readonly router = inject(Router);

  readonly badge = input<Badge | null>(null);
  readonly autoLoad = input<boolean>(true);

  readonly currentBadge = computed(() => {
    // Si un badge est passé en input, l'utiliser
    const inputBadge = this.badge();
    if (inputBadge) return inputBadge;

    // Sinon, utiliser le premier badge disponible du service
    const badges = this.badgeService.badgeList();
    return badges.length > 0 ? badges[0] : null;
  });

  readonly isLoading = signal(false);

  readonly badgeStatus = BadgeStatus;

  readonly statusText = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'Statut inconnu';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'Disponible';
      case BadgeStatus.UNAVAILABLE:
        return 'Indisponible';
      case BadgeStatus.AVAILABLE_FROM:
        return 'Bientôt disponible';
      default:
        return 'Statut inconnu';
    }
  });

  readonly dotClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'bg-gray-400';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-600';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-500';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-accent-500';
      default:
        return 'bg-gray-400';
    }
  });

  readonly badgeClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'bg-gray-100';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-100';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-accent-100';
      default:
        return 'bg-gray-100';
    }
  });

  readonly textClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'text-gray-500';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'text-text';
      case BadgeStatus.UNAVAILABLE:
        return 'text-text';
      case BadgeStatus.AVAILABLE_FROM:
        return 'text-text';
      default:
        return 'text-gray-500';
    }
  });

  readonly availabilityInfo = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return null;

    if (badge.status === BadgeStatus.AVAILABLE_FROM && badge.availableFrom) {
      const date = new Date(badge.availableFrom);
      const now = new Date();

      if (date > now) {
        return `Dès le ${this.formatDate(date)}`;
      } else {
        // If the date has passed, it should probably be AVAILABLE now
        return 'Disponible maintenant';
      }
    }

    if (badge.status === BadgeStatus.UNAVAILABLE && badge.availableFrom) {
      const date = new Date(badge.availableFrom);
      return `Jusqu'au ${this.formatDate(date)}`;
    }

    return null;
  });

  ngOnInit(): void {
    // Charger les badges depuis le service si autoLoad est activé
    if (this.autoLoad()) {
      this.badgeService.loadBadges();
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  onBadgeClick(): void {
    const badge = this.badge() ?? this.currentBadge();
    if (badge) {
      this.router.navigate(['/badges/edit', badge.id]);
    }
  }
}
