import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { HomeBadge } from "@features/users/home/home-badge/home-badge";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-home-banner",
  imports: [HomeBadge, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-background flex justify-center px-4 mt-16">
      <section
        class="text-text border-accent-600 max-w-full flex-col items-center gap-4 rounded-b-lg border px-5 py-4 shadow-lg"
        aria-labelledby="profile-heading"
      >
        <div
          class="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between"
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

            <h1 id="profile-heading" class="text-xl font-bold">
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
