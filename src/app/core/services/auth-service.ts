import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface User {
  id: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => {
    const user = this._user();
    if (!user?.roles) return false;

    const adminRoles = ['admin', 'ADMIN', 'Admin', 'administrator', 'ADMINISTRATOR'];
    return user.roles.some(role =>
      adminRoles.some(adminRole => adminRole.toLowerCase() === role.toLowerCase())
    );
  });

  constructor() {
    this.initializeAuth();
    this.setupAutoRefresh();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error)),
      finalize(() => this._isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  logout(): void {
    this.clearTokens();
    this._user.set(null);
    this._error.set(null);

    this.http.post(`${environment.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      catchError(() => {
        return [];
      })
    ).subscribe();

    this.router.navigate(['/']);
  }

  refreshToken(): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/refresh-token`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.setAccessToken(response.token);
        this.initializeAuth();
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private setAccessToken(accessToken: string): void {
    try {
      localStorage.setItem('auth_access_token', accessToken);
    } catch { /* empty */ }
  }

  getAccessToken(): string | null {
    try {
      return localStorage.getItem('auth_access_token');
    } catch {
      return null;
    }
  }

  private clearTokens(): void {
    try {
      localStorage.removeItem('auth_access_token');
    } catch { /* empty */ }
  }

  private decodeToken(token: string): { sub: string; email: string; roles: string[]; exp: number } | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    if (!token) return false;
    const payload = this.decodeToken(token);
    if (!payload) return false;
    const now = Date.now() / 1000;
    return payload.exp > now;
  }

  private isTokenExpiringSoon(token: string): boolean {
    if (!token) return true;
    const payload = this.decodeToken(token);
    if (!payload) return true;
    const now = Date.now() / 1000;
    return (payload.exp - now) < 300;
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token && this.isTokenValid(token)) {
      const payload = this.decodeToken(token);
      if (payload) {
        this._user.set({
          id: payload.sub,
          email: payload.email,
          roles: Array.isArray(payload.roles) ? payload.roles : []
        });
      }
    }
  }

  private setupAutoRefresh(): void {
    timer(0, 60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const token = this.getAccessToken();

        if (!token || !this.isTokenValid(token)) {
          this.logout();
        } else if (this.isTokenExpiringSoon(token)) {
          this.refreshToken().subscribe({
            error: () => {
              console.warn('Auto-refresh failed');
            }
          });
        }
      });
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setAccessToken(response.token);
    this._user.set(response.user);
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    let message = 'Erreur d\'authentification';

    if (error.status === 401) {
      message = 'Identifiants invalides';
    } else if (error.status === 0) {
      message = 'Erreur de connexion';
    } else if (error.status === 429) {
      message = 'Trop de tentatives. Veuillez réessayer plus tard.';
    }

    this._error.set(message);
    return throwError(() => error);
  }
}
