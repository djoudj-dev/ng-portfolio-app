import { Injectable, signal, computed, inject, effect } from "@angular/core";
import { SupabaseService } from "@core/services/supabase.service";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import {
  BadgeModel,
  BadgeStatus,
} from "@features/landing/badge/models/badge-model";

@Injectable({ providedIn: "root" })
export class BadgeService {
  private readonly _badges = signal<BadgeModel[]>([]);
  private readonly _initialized = signal(false);
  private readonly toastService = inject(ToastService);
  private readonly supabaseService = inject(SupabaseService);

  constructor() {
    effect(() => {
      if (!this._initialized()) {
        this._initialized.set(true);
        void this.getBadges();
      }
    });
  }

  public readonly badges = this._badges.asReadonly();
  public readonly latestBadge = computed(() => {
    const badges = this._badges();
    if (!badges.length) return null;
    return badges.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )[0];
  });
  async getBadges() {
    const { data, error } = await this.supabaseService
      .from("badges")
      .select("*");

    if (error) {
      console.error("Erreur lors de la récupération des badges:", error);
      return;
    }
    this._badges.set(data as BadgeModel[]);
  }

  async updateBadgeStatus(id: string, status: BadgeStatus) {
    const { error } = await this.supabaseService
      .from("badges")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Erreur lors de la mise à jour du statut du badge:", error);
      this.toastService.show({
        message: `Échec de la mise à jour du badge: ${error.message}`,
        type: "error",
        duration: 5000,
      });
    } else {
      await this.getBadges();
      this.toastService.show({
        message: "Statut du badge mis à jour avec succès",
        type: "success",
      });
    }
  }

  async updateBadgeAvailability(id: string, availableFrom: string | null) {
    const { error } = await this.supabaseService
      .from("badges")
      .update({
        available_from: availableFrom,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erreur lors de la mise à jour de la disponibilité du badge:",
        error,
      );
      this.toastService.show({
        message: `Échec de la mise à jour de la disponibilité du badge: ${error.message}`,
        type: "error",
        duration: 5000,
      });
    } else {
      await this.getBadges();
      this.toastService.show({
        message: "Disponibilité du badge mise à jour avec succès",
        type: "success",
      });
    }
  }
}
