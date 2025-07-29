import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { DatePipe, NgClass } from "@angular/common";
import { BadgeService } from "@core/services/badge.service";

@Component({
  selector: "app-home-badge",
  imports: [NgClass, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
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
        class="flex flex-wrap items-center rounded-lg px-3 py-1 text-sm font-medium"
      >
        <figure class="relative mr-3" aria-hidden="true">
          <span
            [ngClass]="pulseClasses()"
            class="flex h-3 w-3 rounded-full"
          ></span>
          <span
            [ngClass]="pulseClasses()"
            class="absolute -top-[2px] -left-[2px] h-3.5 w-3.5 animate-ping rounded-full opacity-75 duration-[1500ms]"
          ></span>
        </figure>
        <span>{{ statusText() }}</span>

        <!-- Show date if availableFrom status -->
        @if (
          badgeService.status() === "availableFrom" &&
          badgeService.availableFromDate()
        ) {
          <time
            class="ml-1 whitespace-normal sm:whitespace-nowrap"
            [attr.datetime]="
              badgeService.availableFromDate() | date: 'yyyy-MM-dd'
            "
          >
            {{
              badgeService.availableFromDate() | date: "d MMMM yyyy" : "" : "fr"
            }}
          </time>
        }
      </div>
    </div>
  `,
})
export class HomeBadge {
  // Inject the badge service
  protected readonly badgeService = inject(BadgeService);

  // Use the status and availableFromDate from the service
  readonly status = this.badgeService.status;
  readonly availableFromDate = this.badgeService.availableFromDate;

  // Use the statusText from the service
  readonly statusText = this.badgeService.statusText;

  readonly badgeClasses = computed(() => {
    switch (this.badgeService.status()) {
      case "available":
        return "bg-background text-text border border-green-300";
      case "unavailable":
        return "bg-background text-text border border-red-300";
      case "availableFrom":
        return "bg-background text-text border border-accent-300";
      default:
        return "bg-background text-text border border-gray-300";
    }
  });

  readonly pulseClasses = computed(() => {
    switch (this.badgeService.status()) {
      case "available":
        return "bg-green-500";
      case "unavailable":
        return "bg-red-500";
      case "availableFrom":
        return "bg-accent-500";
      default:
        return "bg-gray-500";
    }
  });
}
