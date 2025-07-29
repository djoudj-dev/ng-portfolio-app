import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BadgeService, LegacyBadgeStatus } from "@core/services/badge.service";

@Component({
  selector: "app-edit-home-badge",
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-background rounded-lg p-6 shadow-md shadow-accent border border-primary-300"
    >
      <h2 class="text-xl font-semibold mb-4">Modifier le badge d'accueil</h2>

      <div class="mb-4">
        <label class="block mb-2 font-medium text-gray-800"
          >Statut du badge</label
        >
        <select
          class="w-full px-3 py-2 border border-primary-200 rounded-md bg-white"
          [ngModel]="badge().status"
          (ngModelChange)="updateStatus($event)"
        >
          <option value="available">Disponible</option>
          <option value="unavailable">Indisponible</option>
          <option value="availableFrom">Disponible à partir de</option>
        </select>
      </div>

      @if (badge().status === "availableFrom") {
        <div class="mb-4">
          <label class="block mb-2 font-medium text-gray-800"
            >Date de disponibilité</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 border border-primary-200 rounded-md bg-white"
            [ngModel]="formatDateForInput(badge().availableFromDate)"
            (ngModelChange)="updateDate($event)"
          />
        </div>
      }

      <!--<div class="mt-6 p-4 border border-primary-200 rounded-lg bg-white">
        <h3 class="text-lg font-semibold mb-2">Aperçu</h3>
        <div
          class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
          [ngClass]="badgeClasses()"
        >
          <span
            class="h-3 w-3 rounded-full mr-2"
            [ngClass]="pulseClasses()"
          ></span>
          <span>{{ statusText() }}</span>
          @if (
            badge().status === "availableFrom" && badge().availableFromDate
          ) {
            <time class="ml-1 text-gray-600">
              {{ badge().availableFromDate | date: "d MMMM yyyy" : "" : "fr" }}
            </time>
          }
        </div>
      </div>-->

      <div class="mt-6">
        <button
          class="px-4 py-2 rounded-md font-medium text-white bg-primary hover:bg-primary-600 transition"
          (click)="saveBadgeChanges()"
        >
          Enregistrer les modifications
        </button>
      </div>
    </div>
  `,
})
export class EditHomeBadge {
  private readonly badgeService = inject(BadgeService);

  readonly badge = this.badgeService.badgeState;
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

  updateStatus(status: LegacyBadgeStatus): void {
    this.badgeService.updateStatus(status);
  }

  updateDate(dateString: string): void {
    const date = dateString ? new Date(dateString) : null;
    this.badgeService.updateDate(date);
  }

  formatDateForInput(date: Date | null | string): string {
    if (!date) return "";

    // Ensure date is a Date object
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      try {
        dateObj = new Date(date);
      } catch (error) {
        console.error("Invalid date format:", error);
        return "";
      }
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date value");
      return "";
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  saveBadgeChanges(): void {
    // Get the current badge ID from localStorage or create a new badge
    const badgeId = localStorage.getItem('currentBadgeId');

    if (badgeId) {
      // Update existing badge
      this.badgeService.updateBadge(this.badgeService.badgeState());
      alert("Les modifications du badge ont été enregistrées avec succès!");
    } else {
      // Create a new badge
      this.badgeService.createBadge().subscribe({
        next: (badge) => {
          // Store the badge ID for future updates
          localStorage.setItem('currentBadgeId', badge.id);
          alert("Un nouveau badge a été créé avec succès!");
        },
        error: (error) => {
          console.error('Error creating badge:', error);
          alert("Erreur lors de la création du badge. Veuillez réessayer.");
        }
      });
    }
  }
}
