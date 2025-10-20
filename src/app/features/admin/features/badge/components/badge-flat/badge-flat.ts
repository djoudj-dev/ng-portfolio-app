import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { Badge, BadgeStatus } from '@features/badge';
import { BadgeService } from '@features/badge';

@Component({
  selector: 'app-badge-flat',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (currentBadge(); as badge) {
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200"
        [class]="badgeClasses()"
      >
        <div class="w-2 h-2 rounded-full animate-pulse" [class]="dotClasses()"></div>
        <span class="text-sm font-semibold" [class]="textClasses()">
          {{ statusText() }}
        </span>
        @if (badge.status === badgeStatusEnum.AVAILABLE_FROM && badge.availableFrom) {
          <span class="text-xs opacity-70" [class]="textClasses()">
            ({{ formatDate(badge.availableFrom) }})
          </span>
        }
      </div>
    } @else {
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-gray-50">
        <div class="w-2 h-2 rounded-full bg-gray-400"></div>
        <span class="text-sm font-semibold text-gray-600">Statut inconnu</span>
      </div>
    }
  `,
})
export class BadgeFlat implements OnInit {
  private readonly badgeService = inject(BadgeService);

  readonly badgeStatusEnum = BadgeStatus;

  readonly currentBadge = computed<Badge | null>(() => {
    const badges = this.badgeService.badgeList();
    return badges.length > 0 ? badges[0] : null;
  });

  readonly statusText = computed(() => {
    const badge = this.currentBadge();
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

  readonly badgeClasses = computed(() => {
    const badge = this.currentBadge();
    if (!badge) return 'border-gray-300 bg-gray-50';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'border-green-200 bg-green-50';
      case BadgeStatus.UNAVAILABLE:
        return 'border-red-200 bg-red-50';
      case BadgeStatus.AVAILABLE_FROM:
        return 'border-amber-200 bg-amber-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  });

  readonly dotClasses = computed(() => {
    const badge = this.currentBadge();
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

  readonly textClasses = computed(() => {
    const badge = this.currentBadge();
    if (!badge) return 'text-gray-600';

    switch (badge.status) {
      case BadgeStatus.AVAILABLE:
        return 'text-green-700';
      case BadgeStatus.UNAVAILABLE:
        return 'text-red-700';
      case BadgeStatus.AVAILABLE_FROM:
        return 'text-amber-700';
      default:
        return 'text-gray-600';
    }
  });

  ngOnInit(): void {
    this.badgeService.loadBadges();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
