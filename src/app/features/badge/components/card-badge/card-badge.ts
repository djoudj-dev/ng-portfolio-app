import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { StatusBadge } from "@features/badge/components/status-badge/status-badge";

@Component({
  selector: "app-card-badge",
  imports: [StatusBadge, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="pt-14 pb-4 flex justify-center bg-background px-4">
      <section
        class="w-full max-w-sm flex flex-row items-center justify-center gap-4 rounded-b-lg border border-accent-600 px-3 py-3 pt-4 text-center shadow-lg sm:max-w-md sm:flex-row sm:items-center sm:justify-center sm:px-4 sm:py-4 md:max-w-2xl"
        aria-labelledby="profile-heading"
      >
        <!-- Logo -->
        <figure class="flex items-center justify-center">
          <img
            [ngSrc]="logoPath()"
            [alt]="title() + ' - Développeur Angular'"
            width="48"
            height="48"
            class="h-10 w-10 sm:h-12 sm:w-12"
          />
        </figure>

        <!-- Titre -->
        <h1
          id="profile-heading"
          class="mt-0 text-base font-bold text-text sm:text-xl"
        >
          {{ title() }}
        </h1>

        <!-- Badge de statut -->
        <aside aria-label="Statut de disponibilité" class="flex justify-center">
          <app-status-badge />
        </aside>
      </section>
    </header>
  `,
})
export class CardBadge {
  readonly title = signal("Développeur Angular");
  readonly logoPath = signal("icons/angular.webp");
}
