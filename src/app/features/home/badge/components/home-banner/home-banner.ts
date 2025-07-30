import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { HomeBadge } from "@features/home/badge/components/home-badge/home-badge";

@Component({
  selector: "app-home-banner",
  imports: [HomeBadge, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mt-14 flex justify-center bg-background px-2">
      <section
        class="flex-col items-center gap-2 rounded-b-lg border border-accent-600 px-4 py-3 shadow-lg sm:px-5 sm:py-4 md:flex-row md:justify-between md:gap-0"
        aria-labelledby="profile-heading"
      >
        <div
          class="flex w-full flex-col items-center gap-2  sm:flex-col md:justify-center"
        >
          <div class="flex items-center gap-4">
            <figure class="flex flex-shrink-0 items-center justify-center">
              <img
                [ngSrc]="logoPath()"
                [alt]="title() + ' - Développeur Angular'"
                width="48"
                height="48"
                class="h-12 w-12"
              />
            </figure>

            <h1
              id="profile-heading"
              class="text-center text-xl font-bold text-text sm:text-left"
            >
              {{ title() }}
            </h1>
          </div>
          <aside aria-label="Statut de disponibilité">
            <app-home-badge />
          </aside>
        </div>
      </section>
    </header>
  `,
})
export class HomeBanner {
  readonly title = signal("Développeur Angular");
  readonly logoPath = signal("icons/angular.webp");
}
