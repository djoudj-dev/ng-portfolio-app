import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BadgeService } from "@features/home/badge/services/badge.service";
import {
  BADGE_STATUS,
  BadgeStatus,
} from "@features/home/badge/models/badge.model";

@Component({
  selector: "app-edit-home-badge",
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-background rounded-lg p-4 sm:p-6 pt-8 sm:pt-12 shadow-md shadow-accent border border-primary-300"
    >
      <h2 class="text-2xl font-bold text-text mb-6">Edition du badge</h2>
      @if (badge()) {
        <div class="mb-4">
          <label class="block mb-2 font-medium text-text"
            >Statut du badge</label
          >
          <select
            class="w-full px-3 py-2 border border-primary-200 rounded-md bg-white text-text"
            [ngModel]="badge()?.status"
            (ngModelChange)="updateStatus($event)"
          >
            <option [value]="BADGE_STATUS.AVAILABLE">Disponible</option>
            <option [value]="BADGE_STATUS.UNAVAILABLE">Indisponible</option>
            <option [value]="BADGE_STATUS.AVAILABLE_FROM">
              Bientôt disponible
            </option>
          </select>
        </div>

        @if (badge()?.status === BADGE_STATUS.AVAILABLE_FROM) {
          <div class="mb-4">
            <label class="block mb-2 font-medium text-text"
              >Date de disponibilité</label
            >
            <input
              type="date"
              class="w-full px-3 py-2 border border-primary-200 rounded-md bg-white text-text"
              [ngModel]="formatDateForInput(badge()?.available_from)"
              (ngModelChange)="updateDate($event)"
            />
          </div>
        }
      } @else {
        <p class="text-text">Aucun badge à modifier pour le moment.</p>
      }
    </div>
  `,
})
export class EditHomeBadge {
  private readonly badgeService = inject(BadgeService);
  readonly badge = this.badgeService.latestBadge;
  public readonly BADGE_STATUS = BADGE_STATUS;

  updateStatus(status: BadgeStatus): void {
    const badgeId = this.badge()?.id;
    if (badgeId) {
      this.badgeService.updateBadgeStatus(badgeId, status);
    }
  }

  updateDate(dateString: string): void {
    const badgeId = this.badge()?.id;
    if (badgeId) {
      const date = dateString ? new Date(dateString).toISOString() : null;
      this.badgeService.updateBadgeAvailability(badgeId, date);
    }
  }

  formatDateForInput(date: string | null | undefined): string {
    if (!date) return "";
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  }
}
