import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import type { AnalyticsQuery, AnalyticsOverview, TotalVisits } from '@features/analytics';
import { AuthService } from '@core/services/auth';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/analytics`;

  async getAnalyticsOverview(query?: AnalyticsQuery): Promise<AnalyticsOverview> {
    // Vérification préventive d'autorisation
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      return Promise.reject(new Error('Accès non autorisé aux analytics'));
    }

    try {
      return await firstValueFrom(
        this.http.get<AnalyticsOverview>(`${this.baseUrl}/overview`, {
          params: this.buildQueryParams(query),
          withCredentials: true,
        }),
      );
    } catch (error: unknown) {
      console.error('Erreur récupération overview analytics:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  async getTotalVisits(query?: AnalyticsQuery): Promise<TotalVisits> {
    // Vérification préventive d'autorisation
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      return Promise.reject(new Error('Accès non autorisé aux analytics'));
    }

    try {
      return await firstValueFrom(
        this.http.get<TotalVisits>(`${this.baseUrl}/totals`, {
          params: this.buildQueryParams(query),
          withCredentials: true,
        }),
      );
    } catch (error: unknown) {
      console.error('Erreur récupération totaux analytics:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }
  private buildQueryParams(query?: AnalyticsQuery): Record<string, string> {
    const params: Record<string, string> = {};

    if (query?.startDate) {
      params['startDate'] = query.startDate;
    }
    if (query?.endDate) {
      params['endDate'] = query.endDate;
    }
    if (query?.period) {
      params['period'] = query.period;
    }
    if (query?.visitorType) {
      params['visitorType'] = query.visitorType;
    }
    if (query?.page) {
      params['page'] = query.page;
    }

    return params;
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
        return 'Données analytics non trouvées.';
      }

      if (httpError.status === 0) {
        return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }

      return `Erreur ${httpError.status ?? 'inconnue'}: ${httpError.message ?? "Une erreur s'est produite"}`;
    }

    return "Une erreur s'est produite";
  }
}
