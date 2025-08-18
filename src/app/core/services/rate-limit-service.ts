import { Injectable, signal } from "@angular/core";

interface RateLimitEntry {
  count: number;
  firstAttempt: Date;
  blockedUntil?: Date;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

@Injectable({ providedIn: "root" })
export class RateLimitService {
  private readonly storage = new Map<string, RateLimitEntry>();
  private readonly isBlocked = signal<boolean>(false);

  /**
   * Vérifie si une action est autorisée selon le rate limiting
   * @param identifier - Identifiant unique (IP, email, etc.)
   * @param config - Configuration du rate limiting
   * @returns true si l'action est autorisée
   */
  checkRateLimit(
    identifier: string,
    config: RateLimitConfig = {
      maxAttempts: 5,
      windowMinutes: 15,
      blockMinutes: 15,
    }
  ): boolean {
    const now = new Date();
    const entry = this.storage.get(identifier);

    // Pas d'entrée précédente
    if (!entry) {
      this.storage.set(identifier, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    // Vérifier si encore bloqué
    if (entry.blockedUntil && entry.blockedUntil > now) {
      this.isBlocked.set(true);
      return false;
    }

    // Vérifier si la fenêtre temporelle est expirée
    const windowExpired =
      now.getTime() - entry.firstAttempt.getTime() >
      config.windowMinutes * 60 * 1000;

    if (windowExpired) {
      // Réinitialiser le compteur
      this.storage.set(identifier, {
        count: 1,
        firstAttempt: now,
      });
      this.isBlocked.set(false);
      return true;
    }

    // Incrémenter le compteur
    entry.count++;

    // Vérifier si limite atteinte
    if (entry.count > config.maxAttempts) {
      entry.blockedUntil = new Date(
        now.getTime() + config.blockMinutes * 60 * 1000
      );
      this.storage.set(identifier, entry);
      this.isBlocked.set(true);
      return false;
    }

    this.storage.set(identifier, entry);
    return true;
  }

  /**
   * Réinitialise le rate limiting pour un identifiant (succès de connexion)
   * @param identifier - Identifiant à réinitialiser
   */
  resetRateLimit(identifier: string): void {
    this.storage.delete(identifier);
    this.isBlocked.set(false);
  }

  /**
   * Obtient le temps restant avant déblocage
   * @param identifier - Identifiant à vérifier
   * @returns Nombre de minutes restantes, ou 0 si pas bloqué
   */
  getBlockTimeRemaining(identifier: string): number {
    const entry = this.storage.get(identifier);
    if (!entry?.blockedUntil) return 0;

    const remaining = entry.blockedUntil.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(remaining / (60 * 1000)));
  }

  /**
   * Signal réactif pour savoir si l'utilisateur est bloqué
   */
  get blocked() {
    return this.isBlocked.asReadonly();
  }

  /**
   * Nettoie les entrées expirées (à appeler périodiquement)
   */
  cleanupExpired(): void {
    const now = new Date();
    for (const [key, entry] of this.storage.entries()) {
      // Supprimer les entrées vieilles de plus d'1 heure
      if (now.getTime() - entry.firstAttempt.getTime() > 60 * 60 * 1000) {
        this.storage.delete(key);
      }
    }
  }
}