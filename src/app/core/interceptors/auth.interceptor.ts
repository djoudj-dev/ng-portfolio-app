import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private isRefreshing = false;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Assurez-vous que withCredentials est défini pour toutes les requêtes API
    if (req.url.includes('/api/')) {
      req = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
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
        // Le refresh token est également expiré, rediriger vers login
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
        return throwError(() => error);
      }),
    );
  }
}
