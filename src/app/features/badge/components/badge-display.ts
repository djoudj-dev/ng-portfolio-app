import {
  Component,
  input,
  computed,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Badge, BadgeStatus } from '../models/badge.model';
import { BadgeService } from '../services/badge-service';

@Component({
  selector: 'app-badge-display',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (currentBadge()) {
      <div
        class="relative px-3 sm:px-4 md:px-6 py-1 sm:py-4 from-background border border-accent rounded-lg shadow-sm"
      >
        <!-- Layout principal - Logo et titre toujours en bandeau horizontal -->
        <div
          class="flex items-center space-x-1.5 sm:space-x-3 md:space-x-4 relative z-10 min-h-[3rem] sm:min-h-0"
        >
          <!-- Logo section -->
          <div class="flex-shrink-0">
            <div class="w-12 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14 p-1">
              <img
                [ngSrc]="'/icons/angular.webp'"
                alt="Angular"
                class="w-full h-full rounded-md"
                height="860"
                width="860"
              />
            </div>
          </div>

          <!-- Section titre avec alternance mobile -->
          <div class="flex-1 min-w-0 pr-1 relative">
            <!-- Titre - alternance en mobile -->
            <div
              class="transition-opacity duration-500 ease-in-out sm:opacity-100"
              [class.opacity-100]="showTitle()"
              [class.opacity-0]="!showTitle()"
            >
              <h3
                class="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-text leading-tight whitespace-nowrap overflow-hidden"
              >
                Développeur Angular
              </h3>
            </div>

            <!-- Badge status mobile -->
            <div
              class="transition-opacity duration-500 ease-in-out absolute inset-0 flex items-center sm:hidden flex justify-center"
              [class.opacity-100]="!showTitle()"
              [class.opacity-0]="showTitle()"
            >
              <div
                class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full border border-text shadow-sm"
                [ngClass]="modernBadgeClasses()"
              >
                <div class="flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full" [ngClass]="modernDotClasses()"></div>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs font-bold tracking-wide" [ngClass]="modernTextClasses()">
                    {{ statusText() }}
                  </span>
                  @if (
                    currentBadge()!.status === badgeStatus.AVAILABLE_FROM &&
                    currentBadge()!.availableFrom
                  ) {
                    <span class="text-xs font-medium opacity-80" [ngClass]="modernTextClasses()">
                      <span class="text-text px-1"
                        >le {{ formatDate(currentBadge()!.availableFrom!) }}</span
                      >
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Badge de statut - desktop (inchangé) -->
          <div class="flex flex-shrink-0 sm:flex">
            <div
              class="hidden sm:inline-flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-text shadow-sm"
              [ngClass]="modernBadgeClasses()"
            >
              <div class="flex items-center justify-center">
                <div
                  class="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
                  [ngClass]="modernDotClasses()"
                ></div>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-sm font-bold tracking-wide" [ngClass]="modernTextClasses()">
                  {{ statusText() }}
                </span>
                @if (
                  currentBadge()!.status === badgeStatus.AVAILABLE_FROM &&
                  currentBadge()!.availableFrom
                ) {
                  <span
                    class="text-xs text-text font-medium opacity-80 hidden lg:block"
                    [ngClass]="modernTextClasses()"
                  >
                    <span class="text-text">
                      pour le {{ formatDate(currentBadge()!.availableFrom!) }}
                    </span>
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    } @else if (isLoading()) {
      <div
        class="relative flex items-center space-x-2 sm:space-x-3 md:space-x-4 px-2 sm:px-4 md:px-6 py-2 sm:py-4 bg-gradient-to-r from-background/50 to-background/30 border border-accent/20 rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg backdrop-blur-sm"
      >
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg sm:rounded-xl animate-pulse flex-shrink-0"
        ></div>
        <div class="flex-1 min-w-0 space-y-2">
          <div
            class="h-3 sm:h-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded animate-pulse"
          ></div>
          <div
            class="h-2 sm:h-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded animate-pulse w-3/4"
          ></div>
        </div>
        <div
          class="w-16 h-6 sm:w-20 sm:h-8 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full animate-pulse flex-shrink-0"
        ></div>
      </div>
    } @else {
      <div
        class="flex items-center space-x-2 sm:space-x-3 md:space-x-4 px-2 sm:px-4 md:px-6 py-2 sm:py-4 bg-gradient-to-r from-background/70 to-background/50 border border-accent/20 rounded-lg sm:rounded-2xl shadow-sm sm:shadow-md backdrop-blur-sm opacity-60"
      >
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-1 flex items-center justify-center flex-shrink-0"
        >
          <img
            [ngSrc]="'/icons/angular.webp'"
            alt="Angular"
            class="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-md sm:rounded-lg opacity-40"
            height="860"
            width="860"
          />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm sm:text-lg md:text-xl font-medium text-text truncate">
            Développeur Angular
          </h3>
          <p class="text-xs sm:text-sm text-secondary/50">Non configuré</p>
        </div>
        <div
          class="inline-flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gray-100/50 rounded-full border border-gray-200/50 flex-shrink-0"
        >
          <div class="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-gray-300 rounded-full"></div>
          <span class="text-xs sm:text-sm font-medium text-gray-500">Indisponible</span>
        </div>
      </div>
    }
  `,
})
export class BadgeDisplayComponent implements OnInit, OnDestroy {
  private readonly badgeService = inject(BadgeService);
  private intervalId?: number;

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
  readonly showTitle = signal(true);

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
    if (!badge) return 'bg-gray-50';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-50 border-green-200';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100 border-red-500';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-primary-150 border-primary';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  });

  readonly modernDotClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'bg-gray-400';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-500';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-500';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  });

  readonly modernTextClasses = computed(() => {
    const badge = this.badge() ?? this.currentBadge();
    if (!badge) return 'text-gray-600';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'text-green-600';
      case BadgeStatus.UNAVAILABLE:
        return 'text-red-600';
      case BadgeStatus.AVAILABLE_FROM:
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  });

  ngOnInit(): void {
    if (this.autoLoad()) {
      this.badgeService.loadBadges();
    }

    // Démarrer l'alternance uniquement en mobile
    this.startAlternation();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startAlternation(): void {
    // Alterner toutes les 3 secondes
    this.intervalId = window.setInterval(() => {
      this.showTitle.update((current) => !current);
    }, 3000);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
