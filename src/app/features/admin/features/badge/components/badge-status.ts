import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge, BadgeStatus } from '@features/admin';

@Component({
  selector: 'app-badge-status',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="inline-flex items-center space-x-2">
      <div class="w-3 h-3 rounded-full" [ngClass]="statusIndicatorClasses()"></div>

      <span class="text-sm font-medium" [ngClass]="statusTextClasses()">
        {{ statusText() }}
      </span>

      @if (badge()?.status === badgeStatus.UNAVAILABLE && badge()?.availableFrom) {
        <span class="text-xs text-secondary">
          {{ formatDate(badge()!.availableFrom!) }}
        </span>
      }
    </div>
  `,
})
export class BadgeStatusComponent {
  readonly badge = input<Badge | null>(null);
  readonly showDate = input<boolean>(true);

  readonly badgeStatus = BadgeStatus;

  readonly statusText = computed(() => {
    const badgeData = this.badge();
    if (!badgeData) return 'Statut inconnu';

    switch (badgeData.status) {
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

  readonly statusIndicatorClasses = computed(() => {
    const badgeData = this.badge();
    if (!badgeData) return 'bg-gray-400';

    switch (badgeData.status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-500';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  });

  readonly statusTextClasses = computed(() => {
    const badgeData = this.badge();
    if (!badgeData) return 'text-gray-600';

    switch (badgeData.status) {
      case BadgeStatus.AVAILABLE:
        return 'text-green-700';
      case BadgeStatus.UNAVAILABLE:
        return 'text-red-700';
      case BadgeStatus.AVAILABLE_FROM:
        return 'text-accent-700';
      default:
        return 'text-gray-600';
    }
  });

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
