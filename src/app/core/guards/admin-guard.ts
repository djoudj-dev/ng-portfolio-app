import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { SupabaseService } from "@app/core/services/supabase.service";

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.isAdmin()) {
    return true;
  }

  // Redirige vers la page d'accueil si l'utilisateur n'est pas admin
  return router.createUrlTree(["/landing"]);
};
