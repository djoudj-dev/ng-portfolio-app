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
        class="group relative items-center space-x-4 px-6 py-4 from-background border border-accent rounded-b-lg shadow-xl hover:shadow-2xl flex justify-between cursor-pointer transition-all duration-500 hover:scale-105 hover:border-accent/50 backdrop-blur-sm"
        (click)="onBadgeClick()"
      >
        <div
          class="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
        ></div>
        <div class="relative z-10">
          <div
            class="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 p-1 group-hover:scale-110 transition-transform duration-300"
          >
            <img
              [ngSrc]="'/icons/skills/angular.webp'"
              alt="Angular"
              class="w-full h-full rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300"
              height="860"
              width="860"
            />
          </div>
          <div
            class="absolute inset-0 w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"
          ></div>
        </div>

        <!-- Texte avec gradient moderne -->
        <div class="flex-1 text-center relative z-10">
          <h3
            class="text-2xl font-bold bg-gradient-to-r from-text via-accent to-primary bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-300"
          >
            Développeur Angular
          </h3>
        </div>

        <!-- Badge de statut moderne avec glassmorphism -->
        <div class="relative z-10">
          <div
            class="inline-flex items-center space-x-3 px-4 py-2 rounded-4xl border  border-text shadow-lg backdrop-blur-sm"
            [ngClass]="modernBadgeClasses()"
          >
            <!-- Status dot avec animations -->
            <div class="relative flex items-center justify-center w-6 h-6">
              <!-- Dot principal centré -->
              <div
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg transition-all duration-300 group-hover:scale-110 z-10"
                [ngClass]="modernDotClasses()"
              ></div>

              <!-- Animations pour AVAILABLE_FROM -->
              @if (currentBadge()!.status === badgeStatus.AVAILABLE_FROM) {
                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-ping opacity-70 bg-amber-400/40"
                ></div>
                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full animate-pulse opacity-25 bg-amber-400/20"
                ></div>
              }

              <!-- Animations pour AVAILABLE -->
              @if (currentBadge()!.status === badgeStatus.AVAILABLE) {
                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-400/30 animate-pulse"
                ></div>
                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-400/15 animate-ping"
                ></div>
              }

              <!-- Animations pour UNAVAILABLE -->
              @if (currentBadge()!.status === badgeStatus.UNAVAILABLE) {
                <div
                  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-400/15 animate-pulse"
                ></div>
              }
            </div>

            <!-- Status text avec effet -->
            <div class="flex flex-col items-center space-y-1">
              <span class="text-sm font-bold tracking-wide" [ngClass]="modernTextClasses()">
                {{ statusText() }}
              </span>
              @if (
                currentBadge()!.status === badgeStatus.AVAILABLE_FROM &&
                currentBadge()!.availableFrom
              ) {
                <span
                  class="text-xs text-text font-medium opacity-80"
                  [ngClass]="modernTextClasses()"
                >
                  Pour le {{ formatDate(currentBadge()!.availableFrom!) }}
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Info supplémentaire avec style moderne -->
        @if (availabilityInfo(); as info) {
          <div
            class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"
          >
            <span
              class="text-xs text-secondary/70 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-accent/20"
            >
              {{ info }}
            </span>
          </div>
        }
      </div>
    } @else if (isLoading()) {
      <div
        class="relative items-center space-x-4 px-6 py-4 bg-gradient-to-r from-background/50 to-background/30 border border-accent/20 rounded-2xl shadow-lg backdrop-blur-sm"
      >
        <div class="flex items-center justify-center space-x-4">
          <div
            class="w-14 h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl animate-pulse"
          ></div>
          <div class="flex-1 space-y-2">
            <div
              class="h-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded animate-pulse"
            ></div>
            <div
              class="h-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded animate-pulse w-3/4"
            ></div>
          </div>
          <div
            class="w-20 h-8 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full animate-pulse"
          ></div>
        </div>
      </div>
    } @else {
      <div
        class="items-center space-x-4 px-6 py-4 bg-gradient-to-r from-background/70 to-background/50 border border-accent/20 rounded-2xl shadow-md backdrop-blur-sm opacity-60"
      >
        <div class="flex items-center justify-between w-full">
          <div
            class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-1 flex items-center justify-center"
          >
            <img
              [ngSrc]="'/icons/skills/angular.webp'"
              alt="Angular"
              class="w-8 h-8 rounded-lg opacity-40"
              height="860"
              width="860"
            />
          </div>
          <div class="flex-1 text-center">
            <h3 class="text-xl font-medium text-text/60">Développeur Angular</h3>
            <p class="text-sm text-secondary/50">Non configuré</p>
          </div>
          <div
            class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100/50 rounded-full border border-gray-200/50"
          >
            <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span class="text-sm font-medium text-gray-500">Indisponible</span>
          </div>
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

  // Nouvelles méthodes pour le design moderne
  readonly modernBadgeClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'bg-gray-50/50';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-background/50 border-background/20';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-gradient-to-r from-red-50/80 to-rose-50/80 border-red-200/50';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30';
      default:
        return 'bg-gray-50/50 border-gray-200/50';
    }
  });

  readonly modernDotClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'bg-gray-400';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200/50 ring-2 ring-emerald-300/20';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200/50 ring-2 ring-red-300/20';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 ring-2 ring-amber-300/20';
      default:
        return 'bg-gray-400';
    }
  });

  readonly modernTextClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'text-gray-600';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'text-emerald-600 font-semibold drop-shadow-sm';
      case BadgeStatus.UNAVAILABLE:
        return 'text-red-600 font-semibold drop-shadow-sm';
      case BadgeStatus.AVAILABLE_FROM:
        return 'text-amber-600 font-semibold drop-shadow-sm';
      default:
        return 'text-gray-600';
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
    if (this.autoLoad()) {
      this.badgeService.loadBadges();
    }
  }

  formatDate(date: Date): string {
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
