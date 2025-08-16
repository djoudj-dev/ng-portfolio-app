import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { EditBadge } from "@features/landing/badge/components/edit-badge/edit-badge";
import { ButtonComponent } from "@shared/ui/button/button";
import { BadgeService } from "@features/landing/badge/services/badge-service";
import { BadgeStatus } from "@features/landing/badge/models/badge-model";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-badge-manager",
  imports: [EditBadge, ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-primary-200 dark:border-primary-700 pb-4">
        <h1 class="text-2xl font-bold text-text">Gestion des badges</h1>
        <p class="text-secondary mt-1">
          Gérez vos badges de compétences et certifications
        </p>
      </div>

      <!-- Badge Editor -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-text">Éditeur de badge</h2>
          <div class="flex gap-2">
            <app-button color="secondary">
              <div class="flex items-center">
                <img
                  [ngSrc]="'/icons/preview.svg'"
                  alt="Prévisualiser"
                  class="w-4 h-4 mr-2 icon-invert"
                  width="16"
                  height="16"
                />
                Prévisualiser
              </div>
            </app-button>
          </div>
        </div>

        <app-edit-badge />
      </div>

      <!-- Badge List -->
      <div
        class="bg-background rounded-xl border border-primary-200 dark:border-primary-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-text">Badges existants</h2>
          <app-button color="primary">
            <div class="flex items-center">
              <img
                [ngSrc]="'/icons/plus.svg'"
                alt="Ajouter"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Nouveau badge
            </div>
          </app-button>
        </div>

        <!-- Badge Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (badge of badges(); track badge.id) {
            <div
              class="p-4 border border-primary-200 dark:border-primary-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-text"
                  >Badge {{ badge.id }}</span
                >
                <span
                  [class]="getBadgeStatusClass(badge.status)"
                  class="text-xs px-2 py-1 rounded-full"
                >
                  {{ getBadgeStatusLabel(badge.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-secondary">
                  @if (badge.available_from) {
                    Disponible depuis {{ formatDate(badge.available_from) }}
                  } @else {
                    Créé le {{ formatDate(badge.created_at) }}
                  }
                </span>
                <div class="flex gap-1">
                  <button
                    (click)="toggleBadgeStatus(badge.id, badge.status)"
                    class="p-1 hover:bg-accent-100 dark:hover:bg-accent-800 rounded"
                    title="Changer le statut"
                  >
                    <img
                      [ngSrc]="'/icons/refresh.svg'"
                      alt="Toggle"
                      class="w-4 h-4 icon-invert"
                      width="16"
                      height="16"
                    />
                  </button>
                  <button
                    class="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
                  >
                    <img
                      [ngSrc]="'/icons/edit.svg'"
                      alt="Modifier"
                      class="w-4 h-4 icon-invert"
                      width="16"
                      height="16"
                    />
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full text-center py-12">
              <img
                [ngSrc]="'/icons/badge.svg'"
                alt="Aucun badge"
                class="w-12 h-12 mx-auto mb-4 opacity-50 icon-invert"
                width="48"
                height="48"
              />
              <p class="text-secondary">Aucun badge trouvé</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class BadgeManagerComponent {
  private readonly badgeService = inject(BadgeService);

  readonly badges = this.badgeService.badges;

  getBadgeStatusClass(status: BadgeStatus): string {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "UPCOMING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "UNAVAILABLE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "AVAILABLE_FROM":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  }

  getBadgeStatusLabel(status: BadgeStatus): string {
    switch (status) {
      case "AVAILABLE":
        return "Actif";
      case "UPCOMING":
        return "À venir";
      case "UNAVAILABLE":
        return "Indisponible";
      case "AVAILABLE_FROM":
        return "Programmé";
      default:
        return "Inconnu";
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  async toggleBadgeStatus(
    badgeId: string,
    currentStatus: BadgeStatus,
  ): Promise<void> {
    const nextStatus: BadgeStatus =
      currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
    await this.badgeService.updateBadgeStatus(badgeId, nextStatus);
  }
}
