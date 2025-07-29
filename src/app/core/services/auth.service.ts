import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  // --- State Management with Signals ---
  readonly #isAuthenticated = signal<boolean>(this.hasTokens());
  readonly #accessToken = signal<string | null>(
    localStorage.getItem("accessToken"),
  );

  // Public readonly signals for components to consume
  public readonly isAuthenticated = this.#isAuthenticated.asReadonly();
  public readonly accessToken = this.#accessToken.asReadonly();

  private hasTokens(): boolean {
    return (
      !!localStorage.getItem("accessToken") &&
      !!localStorage.getItem("refreshToken")
    );
  }

  // --- Authentication Methods ---

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http
      .post<{
        accessToken: string;
        refreshToken: string;
      }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((tokens) => {
          this.storeTokens(tokens.accessToken, tokens.refreshToken);
          this.#isAuthenticated.set(true);
        }),
        catchError((_error) => {
          console.error("Login failed:", _error);
          return throwError(() => new Error("Invalid credentials"));
        }),
      );
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/auth/logout`, null, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearTokens();
          this.router.navigate(["/login"]);
        }),
        catchError((_error) => {
          console.error("Logout failed:", _error);
          // Even if logout fails on the server, clear client-side tokens as a fallback
          this.clearTokens();
          this.router.navigate(["/login"]);
          return throwError(
            () => new Error("Logout failed. Please try again."),
          );
        }),
      );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error("No refresh token available"));
    }

    return this.http
      .post<{
        accessToken: string;
      }>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap((response) => {
          this.storeAccessToken(response.accessToken);
        }),
        catchError((_error) => {
          this.logout().subscribe();
          return throwError(
            () => new Error("Session expired. Please log in again."),
          );
        }),
      );
  }

  // --- Token Management Helpers ---

  private getRefreshToken(): string | null {
    return localStorage.getItem("refreshToken");
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    this.#accessToken.set(accessToken);
  }

  private storeAccessToken(accessToken: string): void {
    localStorage.setItem("accessToken", accessToken);
    this.#accessToken.set(accessToken);
  }

  private clearTokens(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.#isAuthenticated.set(false);
    this.#accessToken.set(null);
  }
}
