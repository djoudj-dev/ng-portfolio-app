import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private isRefreshing = false;

  // Routes qui ne devraient PAS déclencher d'erreurs 401 dans la console pour les visiteurs
  private readonly publicSafeRoutes = [
    '/analytics',
    '/admin',
    '/cv/admin'
  ];

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Assurez-vous que withCredentials est défini pour toutes les requêtes API
    if (req.url.startsWith(environment.apiUrl)) {
      const headers: { [key: string]: string } = {};

      // Ne pas définir Content-Type pour FormData (multipart), le navigateur le fait automatiquement
      if (!(req.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      req = req.clone({
        setHeaders: headers,
        withCredentials: true,
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next, error);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
    _originalError: HttpErrorResponse,
  ): Observable<HttpEvent<unknown>> {
    // Vérifier si cette requête vient d'un utilisateur non autorisé sur des routes admin
    const isAdminRoute = this.publicSafeRoutes.some(route => req.url.includes(route));
    const isUserLoggedIn = this.authService.getCurrentUser() !== null;

    if (isAdminRoute && !isUserLoggedIn) {
      // Supprimer l'erreur de la console pour les visiteurs non connectés
      console.warn(`Accès bloqué à la route admin: ${req.url}. L'utilisateur n'est pas connecté.`);
      return EMPTY; // Retourner un observable vide au lieu d'une erreur
    }

    if (this.isRefreshing) {
      // Si un rafraîchissement est déjà en cours, rediriger vers login
      this.router.navigate(['/login']);
      return throwError(() => new Error('Authentication failed'));
    }

    this.isRefreshing = true;

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        // Réessayer la requête originale
        return next.handle(req);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        // Le refresh token est également expiré, rediriger vers login seulement si l'utilisateur était connecté
        if (isUserLoggedIn) {
          this.authService.logout().subscribe();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      }),
    );
  }
}
