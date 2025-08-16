import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { DatePipe, NgClass } from "@angular/common";
import { BadgeService } from "@features/landing/badge/services/badge-service";
import { BADGE_STATUS } from "@features/landing/badge/models/badge-model";

@Component({
  selector: "app-status-badge",
  imports: [NgClass, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (badge()) {
      <div
        class="inline-block items-center"
        tabindex="0"
        role="button"
        [attr.aria-label]="
          'Statut actuel: ' + statusText() + '. Cliquer pour modifier'
        "
      >
        <div
          [ngClass]="badgeClasses()"
          class="flex flex-wrap items-center rounded-lg px-2 py-0.5 text-xs font-medium sm:px-3 sm:py-1 sm:text-sm"
        >
          <figure class="relative mr-3" aria-hidden="true">
            <span
              [ngClass]="pulseClasses()"
              class="flex h-2 w-2 rounded-full sm:h-3 sm:w-3"
            ></span>
            <span
              [ngClass]="pulseClasses()"
              class="absolute -top-[2px] -left-[2px] h-3 w-3 animate-ping rounded-full opacity-75 duration-[1500ms] sm:h-3.5 sm:w-3.5"
            ></span>
          </figure>
          <span>{{ statusText() }}</span>

          @if (
            badge()?.status === BADGE_STATUS.AVAILABLE_FROM &&
            badge()?.available_from
          ) {
            <time
              class="ml-1 whitespace-normal sm:whitespace-nowrap"
              [attr.datetime]="badge()?.available_from | date: 'yyyy-MM-dd'"
            >
              {{ badge()?.available_from | date: "d MMMM yyyy" : "" : "fr" }}
            </time>
          }
        </div>
      </div>
    }
  `,
})
export class StatusBadge {
  protected readonly badgeService = inject(BadgeService);
  readonly badge = this.badgeService.latestBadge;
  public readonly BADGE_STATUS = BADGE_STATUS;

  readonly statusText = computed(() => {
    const status = this.badge()?.status;
    switch (status) {
      case BADGE_STATUS.AVAILABLE:
        return "Disponible";
      case BADGE_STATUS.UNAVAILABLE:
        return "Indisponible";
      case BADGE_STATUS.AVAILABLE_FROM:
        return "Disponible au";
      default:
        return "Statut inconnu";
    }
  });

  readonly badgeClasses = computed(() => {
    const status = this.badge()?.status;
    switch (status) {
      case BADGE_STATUS.AVAILABLE:
        return "bg-background text-text border border-green-300";
      case BADGE_STATUS.UNAVAILABLE:
        return "bg-background text-text border border-red-300";
      case BADGE_STATUS.AVAILABLE_FROM:
        return "bg-background text-text border border-accent-300";
      default:
        return "bg-background text-text border border-gray-300";
    }
  });

  readonly pulseClasses = computed(() => {
    const status = this.badge()?.status;
    switch (status) {
      case BADGE_STATUS.AVAILABLE:
        return "bg-green-500";
      case BADGE_STATUS.UNAVAILABLE:
        return "bg-red-500";
      case BADGE_STATUS.AVAILABLE_FROM:
        return "bg-accent-500";
      default:
        return "bg-gray-500";
    }
  });
}
