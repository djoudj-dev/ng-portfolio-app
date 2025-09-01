import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

/**
 * Guard pour protéger les routes admin
 * Vérifie que l'utilisateur est connecté et a le rôle admin
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Rediriger vers la page d'accueil si non connecté
    router.navigate(['/']);
    return false;
  }

  if (!authService.isAdmin()) {
    // Rediriger vers la page d'accueil si pas admin
    router.navigate(['/']);
    return false;
  }

  return true;
};
