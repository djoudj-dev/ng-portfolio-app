import { Injectable, inject } from '@angular/core';
import { Observable, EMPTY, timer, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '@core/services/auth';
import { AnalyticsService } from '@features/analytics';
import type { AnalyticsQuery, AnalyticsOverview, TotalVisits } from '@features/analytics';
import { ProjectService } from '@features/projects';
import type { ProjectPaginatedResponse } from '@features/projects/models/project-model';
import { CvService } from '@features/cv';
import type { CvMetadata } from '@features/cv';

/**
 * Service qui gère les ressources admin de manière sécurisée
 * Évite les appels API non autorisés qui génèrent des erreurs 401
 */
@Injectable({
  providedIn: 'root'
})
export class AdminResourceService {
  private readonly auth = inject(AuthService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly projectService = inject(ProjectService);
  private readonly cvService = inject(CvService);

  /**
   * Crée un timer sécurisé qui ne se déclenche que si l'utilisateur est admin
   */
  createSecureTimer(intervalMs: number): Observable<number> {
    return timer(0, intervalMs).pipe(
      switchMap(() => {
        // Vérifier l'autorisation à chaque tick
        if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
          console.log('Timer admin bloqué: utilisateur non autorisé');
          return EMPTY;
        }
        return [0]; // Émettre une valeur pour continuer le flux
      })
    );
  }

  /**
   * Version sécurisée du chargement des analytics
   */
  loadAnalyticsOverview(query?: AnalyticsQuery): Observable<AnalyticsOverview> {
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      console.warn('Appel analytics bloqué: utilisateur non autorisé');
      return EMPTY as Observable<never> as unknown as Observable<AnalyticsOverview>;
    }

    return from(this.analyticsService.getAnalyticsOverview(query)).pipe(
      catchError((error) => {
        console.warn('Erreur analytics (silencieuse):', error.message);
        return EMPTY as Observable<never> as unknown as Observable<AnalyticsOverview>;
      })
    );
  }

  /**
   * Version sécurisée du chargement des totaux de visites
   */
  loadTotalVisits(query?: AnalyticsQuery): Observable<TotalVisits> {
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      console.warn('Appel total visits bloqué: utilisateur non autorisé');
      return EMPTY as Observable<never> as unknown as Observable<TotalVisits>;
    }

    return from(this.analyticsService.getTotalVisits(query)).pipe(
      catchError((error) => {
        console.warn('Erreur total visits (silencieuse):', error.message);
        return EMPTY as Observable<never> as unknown as Observable<TotalVisits>;
      })
    );
  }

  /**
   * Version sécurisée du chargement des projets
   */
  loadProjects(): Observable<ProjectPaginatedResponse> {
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      console.warn('Appel projects bloqué: utilisateur non autorisé');
      return EMPTY as Observable<never> as unknown as Observable<ProjectPaginatedResponse>;
    }

    return from(this.projectService.getAllProjects()).pipe(
      catchError((error) => {
        console.warn('Erreur projects (silencieuse):', error.message);
        return EMPTY as Observable<never> as unknown as Observable<ProjectPaginatedResponse>;
      })
    );
  }

  /**
   * Version sécurisée du chargement des CVs
   */
  loadCvMetadata(): Observable<CvMetadata> {
    if (!(this.auth.isAuthenticated() && this.auth.isAdmin())) {
      console.warn('Appel CV metadata bloqué: utilisateur non autorisé');
      return EMPTY as Observable<never> as unknown as Observable<CvMetadata>;
    }

    return from(this.cvService.getCurrentCvMetadata()).pipe(
      catchError((error) => {
        console.warn('Erreur CV metadata (silencieuse):', error.message);
        return EMPTY as Observable<never> as unknown as Observable<CvMetadata>;
      })
    );
  }
}
