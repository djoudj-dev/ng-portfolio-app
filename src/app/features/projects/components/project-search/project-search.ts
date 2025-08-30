import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { ButtonComponent } from "@shared/ui/button/button";
import { ProjectFilter } from "@features/projects/models/project-model";
import { ProjectCategory } from "@features/projects/enums/project-enum";

@Component({
  selector: "app-project-search",
  imports: [ButtonComponent],
  template: `
    <section class="mb-8" aria-labelledby="search-filter-section">
      <h2 id="search-filter-section" class="sr-only">Recherche et filtres</h2>

      <div class="flex flex-col justify-center gap-4 sm:flex-row">
        <div class="relative w-full sm:w-72">
          <input
            type="text"
            class="bg-background-200 text-text border-primary focus:ring-accent w-full rounded-lg border px-4 py-2 focus:ring-2 focus:outline-none"
            placeholder="Rechercher un projet..."
            [value]="searchQuery()"
            (input)="onSearch($event)"
            aria-label="Rechercher un projet"
          />
          @if (searchQuery()) {
            <button
              (click)="clearSearch()"
              class="text-text absolute top-1/2 right-3 -translate-y-1/2 transform opacity-70 hover:opacity-100"
              aria-label="Réinitialiser la recherche"
            >
              ✕
            </button>
          }
        </div>
      </div>

      <!-- Filter buttons -->
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        @for (filter of filters(); track filter.value) {
          <app-button
            [color]="filter.active ? 'secondary' : 'accent'"
            [customClass]="'px-3 py-1 text-sm'"
            (buttonClick)="setFilter(filter.value)"
            [attr.aria-pressed]="filter.active"
          >
            {{ filter.label }}
          </app-button>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectSearch {
  // Inputs
  readonly searchQuery = input<string>("");
  readonly filters = input<ProjectFilter[]>([
    { label: "Tous", value: "all", active: true },
    { label: "Frontend", value: ProjectCategory.FRONTEND, active: false },
    { label: "Backend", value: ProjectCategory.BACKEND, active: false },
  ]);

  // Outputs
  readonly searchChange = output<string>();
  readonly clearSearchEvent = output<void>();
  readonly filterChange = output<ProjectCategory | "all">();

  // Methods
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }

  clearSearch(): void {
    this.clearSearchEvent.emit();
  }

  setFilter(filter: ProjectCategory | "all"): void {
    this.filterChange.emit(filter);
  }
}
