import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';
import {
  Badge,
  BadgeStatus,
  UpdateBadgeRequest,
  CreateBadgeRequest,
  BadgeResponse,
} from '../models/badge.model';
import { AuthService } from '@core/services/auth';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/badges`;
  private readonly badges = signal<Badge[]>([]);

  readonly badgeList = this.badges.asReadonly();

  private getAuthOptions() {
    return {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
  }

  findAll(): Observable<Badge[]> {
    return this.http.get<BadgeResponse[]>(this.apiUrl).pipe(
      map((responses) => responses.map((response) => this.mapResponseToBadge(response))),
      catchError((error) => {
        if (error.status === 404) {
          return of([this.getMockBadge()]);
        }
        return this.handleError(error);
      }),
    );
  }

  findOne(id: string): Observable<Badge> {
    return this.http.get<BadgeResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => this.mapResponseToBadge(response)),
      catchError((error) => {
        if (error.status === 404) {
          return of(this.getMockBadge());
        }
        return this.handleError(error);
      }),
    );
  }

  create(createRequest: CreateBadgeRequest): Observable<Badge> {
    return this.http.post<BadgeResponse>(this.apiUrl, createRequest, this.getAuthOptions()).pipe(
      map((response) => this.mapResponseToBadge(response)),
      catchError((error) => {
        if (error.status === 404) {
          const mockBadge = this.getMockBadge();
          return of({
            ...mockBadge,
            status: createRequest.status ?? BadgeStatus.AVAILABLE,
            availableFrom: createRequest.availableFrom
              ? new Date(createRequest.availableFrom)
              : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return this.handleError(error);
      }),
    );
  }

  update(id: string, updateRequest: UpdateBadgeRequest): Observable<Badge> {
    return this.http
      .patch<BadgeResponse>(`${this.apiUrl}/${id}`, updateRequest, this.getAuthOptions())
      .pipe(
        map((response) => this.mapResponseToBadge(response)),
        catchError((error) => {
          if (error.status === 404) {
            const mockBadge = this.getMockBadge();
            return of({
              ...mockBadge,
              status: updateRequest.status ?? mockBadge.status,
              availableFrom: updateRequest.availableFrom
                ? new Date(updateRequest.availableFrom)
                : mockBadge.availableFrom,
              updatedAt: new Date(),
            });
          }
          return this.handleError(error);
        }),
      );
  }
  private mapResponseToBadge(response: BadgeResponse): Badge {
    return {
      id: response.id,
      status: response.status,
      availableFrom: response.availableFrom ? new Date(response.availableFrom) : null,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  private getMockBadge(): Badge {
    return {
      id: 'mock-badge-1',
      status: BadgeStatus.AVAILABLE,
      availableFrom: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    };
  }

  private readonly handleError = (error: unknown) => {
    let errorMessage = 'Une erreur est survenue';

    if (typeof error === 'object' && error !== null && 'status' in error) {
      const httpError = error as { status: number; error?: { message?: string } };

      if (httpError.status === 401) {
        errorMessage = 'Non autorisé - Token JWT requis';
        this.authService.logout();
      } else if (httpError.status === 403) {
        errorMessage = 'Accès refusé - Rôle ADMIN requis';
      } else if (httpError.status === 404) {
        errorMessage = 'Badge non trouvé';
      } else if (httpError.status === 400) {
        errorMessage = 'Données invalides';
      } else if (httpError.error?.message) {
        errorMessage = httpError.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  };

  delete(id: string): Observable<Badge> {
    return this.http.delete<BadgeResponse>(`${this.apiUrl}/${id}`, this.getAuthOptions()).pipe(
      map((response) => this.mapResponseToBadge(response)),
      catchError(this.handleError),
    );
  }

  loadBadges(): void {
    this.findAll().subscribe({
      next: (badges) => this.badges.set(badges),
      error: (error) => console.error('Erreur lors du chargement des badges:', error),
    });
  }
}
