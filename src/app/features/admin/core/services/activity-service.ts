import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';
import type { Activity, ActivityResponse } from '@features/admin';
import { ActivityType, ActivityAction, EntityType } from '@features/admin';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/activities`;

  // Subject pour notifier les nouvelles activités
  private readonly _newActivity = new BehaviorSubject<Activity | null>(null);
  public readonly newActivity$ = this._newActivity.asObservable();

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    const url = `${this.baseUrl}/recent`;
    const response = await firstValueFrom(
      this.http.get<ActivityResponse>(url, {
        params: { limit: limit.toString() },
        withCredentials: true,
      }),
    );

    if (!response.activities || !Array.isArray(response.activities)) {
      throw new Error('Format de réponse des activités invalide');
    }

    return response.activities.map((activity) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }));
  }

  async getActivities(page = 1, limit = 20): Promise<ActivityResponse> {
    try {
      return await firstValueFrom(
        this.http.get<ActivityResponse>(this.baseUrl, {
          params: {
            page: page.toString(),
            limit: limit.toString(),
          },
          withCredentials: true,
        }),
      );
    } catch (error: unknown) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Méthode pour enregistrer une nouvelle activité
  logActivity(
    type: ActivityType,
    action: ActivityAction,
    entityType: EntityType,
    description: string,
    entityId?: string,
    entityName?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const activity: Activity = {
      id: this.generateId(),
      type,
      action,
      entityType,
      entityId,
      entityName,
      description,
      timestamp: new Date(),
      metadata,
    };

    // Notifier les composants de la nouvelle activité
    this._newActivity.next(activity);

    // Optionnel : envoyer au backend pour persistance
    this.sendActivityToBackend(activity).catch((error) => {
      console.error('Erreur envoi activité au backend:', error);
    });
  }

  private async sendActivityToBackend(activity: Activity): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}`, activity, {
          withCredentials: true,
        }),
      );
    } catch (error: unknown) {
      // Gestion silencieuse des erreurs pour ne pas impacter l'UX
      console.error('Erreur envoi activité:', error);
    }
  }


  getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      [ActivityType.BADGE]: '🏷️',
      [ActivityType.PROJECT]: '🚀',
      [ActivityType.CV]: '📄',
      [ActivityType.MESSAGE]: '📧',
      [ActivityType.SYSTEM]: '⚙️',
      [ActivityType.USER]: '👤',
    };
    return icons[type] || '📋';
  }

  getActivityTypeLabel(type: ActivityType): string {
    const labels: Record<ActivityType, string> = {
      [ActivityType.BADGE]: 'B',
      [ActivityType.PROJECT]: 'P',
      [ActivityType.CV]: 'C',
      [ActivityType.MESSAGE]: 'M',
      [ActivityType.SYSTEM]: 'S',
      [ActivityType.USER]: 'U',
    };
    return labels[type] || 'A';
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return 'Il y a 1 jour';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  }

  private getErrorMessage(error: unknown): string {
    if (
      error &&
      typeof error === 'object' &&
      'error' in error &&
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      return error.error.message as string;
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; message?: string };

      if (httpError.status === 401) {
        return 'Non autorisé. Veuillez vous reconnecter.';
      }

      if (httpError.status === 403) {
        return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      }

      if (httpError.status === 404) {
        return 'Activités non trouvées.';
      }

      if (httpError.status === 0) {
        return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }

      return `Erreur ${httpError.status ?? 'inconnue'}: ${httpError.message ?? "Une erreur s'est produite"}`;
    }

    return "Une erreur s'est produite";
  }
}
