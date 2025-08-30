import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { environment } from '@environments/environment';
import { throwError } from 'rxjs';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (shouldSkipAuthentication(req)) {
    return next(req);
  }

  if (req.method === 'GET') {
    const token = authService.getAccessToken();
    if (token) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(authReq);
    }
    return next(req);
  }

  if (requiresAuthentication(req)) {
    const token = authService.getAccessToken();

    if (!token || !authService.isAuthenticated()) {
      router.navigate(['/login']);
      return throwError(() => new HttpErrorResponse({
        error: 'Authentification requise pour cette opération',
        status: 401,
        statusText: 'Unauthorized'
      }));
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
}

function shouldSkipAuthentication(req: HttpRequest<unknown>): boolean {
  const skipEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
  return skipEndpoints.some(endpoint => req.url.includes(endpoint)) ||
         !req.url.startsWith(environment.apiUrl);
}

function requiresAuthentication(req: HttpRequest<unknown>): boolean {
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return protectedMethods.includes(req.method.toUpperCase()) &&
         req.url.startsWith(environment.apiUrl);
}
