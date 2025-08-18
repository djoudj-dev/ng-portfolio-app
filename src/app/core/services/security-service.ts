import { Injectable, inject, computed } from "@angular/core";
import { SupabaseService } from "@core/services/supabase-service";
import { RateLimitService } from "@core/services/rate-limit-service";
import { AuditService } from "@core/services/audit-service";

@Injectable({ providedIn: "root" })
export class SecurityService {
  private readonly supabase = inject(SupabaseService);
  private readonly rateLimitService = inject(RateLimitService);
  private readonly auditService = inject(AuditService);

  // Permissions basées sur le rôle utilisateur
  readonly canRead = computed(() => true);
  readonly canCreate = computed(() => this.supabase.isAdmin());
  readonly canUpdate = computed(() => this.supabase.isAdmin());
  readonly canDelete = computed(() => this.supabase.isAdmin());
  readonly canAccessAdmin = computed(() => this.supabase.isAdmin());

  // État de rate limiting
  readonly isRateLimited = computed(() => this.rateLimitService.blocked());

  /**
   * Vérifie si l'utilisateur peut effectuer une action CRUD
   * @param action - Type d'action (create, read, update, delete)
   * @returns true si l'action est autorisée
   */
  canPerformAction(action: "create" | "read" | "update" | "delete"): boolean {
    switch (action) {
      case "read":
        return this.canRead();
      case "create":
        return this.canCreate();
      case "update":
        return this.canUpdate();
      case "delete":
        return this.canDelete();
      default:
        return false;
    }
  }

  /**
   * Wrapper sécurisé pour les opérations CRUD avec audit automatique
   * @param operation - Fonction à exécuter
   * @param auditInfo - Informations pour l'audit
   */
  async executeSecureOperation<T>(
    operation: () => Promise<T>,
    auditInfo: {
      action: "create" | "update" | "delete";
      table: string;
      recordId: string;
      data?: unknown;
      oldData?: unknown;
    },
  ): Promise<T> {
    // Vérifier les permissions
    if (!this.canPerformAction(auditInfo.action)) {
      throw new Error(`Action non autorisée: ${auditInfo.action}`);
    }

    try {
      // Exécuter l'opération
      const result = await operation();

      // Logger l'action pour audit
      await this.auditService.logAdminAction({
        action: auditInfo.action,
        table_name: auditInfo.table,
        record_id: auditInfo.recordId,
        old_data: auditInfo.oldData,
        new_data: auditInfo.data,
      });

      return result;
    } catch (error) {
      // Logger l'échec (optionnel)
      console.error(`Échec de l'opération ${auditInfo.action}:`, error);
      throw error;
    }
  }

  /**
   * Vérifie le rate limiting pour une action
   * @param identifier - Identifiant unique
   * @param config - Configuration optionnelle du rate limit
   */
  checkRateLimit(
    identifier: string,
    config?: {
      maxAttempts: number;
      windowMinutes: number;
      blockMinutes: number;
    },
  ): boolean {
    return this.rateLimitService.checkRateLimit(identifier, config);
  }

  /**
   * Réinitialise le rate limiting (après succès)
   * @param identifier - Identifiant à réinitialiser
   */
  resetRateLimit(identifier: string): void {
    this.rateLimitService.resetRateLimit(identifier);
  }

  /**
   * Obtient les informations sur le blocage actuel
   * @param identifier - Identifiant à vérifier
   */
  getBlockInfo(identifier: string): {
    isBlocked: boolean;
    minutesRemaining: number;
  } {
    const minutesRemaining =
      this.rateLimitService.getBlockTimeRemaining(identifier);
    return {
      isBlocked: minutesRemaining > 0,
      minutesRemaining,
    };
  }

  /**
   * Nettoie les données de rate limiting expirées
   * À appeler périodiquement (ex: dans un interceptor)
   */
  cleanupExpiredData(): void {
    this.rateLimitService.cleanupExpired();
  }
}
