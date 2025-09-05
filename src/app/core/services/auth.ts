import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@environments/environment';
import type { User, LoginRequest, AuthResponse, AuthState } from '@app/core';

// Re-export les types pour compatibilité
export type { User, LoginRequest, AuthResponse, AuthState } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // État privé avec signaux
  private readonly _authState = signal<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  // Signaux publics (lecture seule)
  readonly authState = this._authState.asReadonly();
  readonly user = computed(() => this._authState().user);
  readonly isLoading = computed(() => this._authState().isLoading);
  readonly error = computed(() => this._authState().error);
  readonly isAuthenticated = computed(() => this._authState().user !== null);
  readonly isAdmin = computed(() => this.hasRole('admin'));

  // Observables pour compatibilité avec le guide
  readonly currentUser$ = computed(() => this._authState().user);
  readonly isAuthenticated$ = computed(() => !!this._authState().user);

  constructor() {
    // Vérifier le statut d'authentification au démarrage
    this.checkAuthStatus();
  }

  /**
   * Connexion utilisateur avec cookies HTTP
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._authState.update((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, {
        withCredentials: true, // Important : inclut les cookies dans les requêtes
      })
      .pipe(
        tap((response) => {
          this._authState.update((state) => ({
            ...state,
            user: response.user,
            isLoading: false,
            error: null,
          }));
        }),
        tap({
          error: (error) => {
            this._authState.update((state) => ({
              ...state,
              isLoading: false,
              error: error.error?.message ?? 'Erreur de connexion',
            }));
          },
        }),
      );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): Observable<{ message: string }> {
    this._authState.update((state) => ({
      ...state,
      isLoading: true,
    }));

    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          this._authState.update(() => ({
            user: null,
            isLoading: false,
            error: null,
          }));
        }),
        tap({
          error: (error) => {
            this._authState.update((state) => ({
              ...state,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Erreur de déconnexion',
            }));
          },
        }),
      );
  }

  /**
   * Rafraîchissement du token d'accès
   */
  refreshToken(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/refresh-token`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  /**
   * Vérification du statut d'authentification
   */
  private checkAuthStatus(): void {
    this._authState.update((state) => ({
      ...state,
      user: null,
    }));
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this._authState().user;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   * Vérification insensible à la casse pour plus de robustesse
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }

    // Vérification insensible à la casse pour gérer 'admin', 'ADMIN', etc.
    return user.roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase());
  }

  clearError(): void {
    this._authState.update((state) => ({
      ...state,
      error: null,
    }));
  }

  /**
   * Récupérer le token depuis les cookies (pour compatibilité)
   * Note: Avec l'auth basée sur les cookies, cette méthode n'est pas nécessaire
   * mais elle est fournie pour la compatibilité avec d'autres services
   */
  getToken(): string | null {
    // Dans notre cas, les tokens sont dans les cookies HTTP-only
    // Cette méthode retourne null car nous utilisons withCredentials
    return null;
  }
}
