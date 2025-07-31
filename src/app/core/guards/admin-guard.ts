import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { AuthService } from "@app/core/services/auth-service";

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }

  // Redirige vers la page d'accueil si l'utilisateur n'est pas admin
  return router.createUrlTree(["/landing"]);
};
