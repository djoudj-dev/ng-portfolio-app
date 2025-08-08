import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { SupabaseService } from "@app/core/services/supabase.service";

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.user()) {
    return true;
  }

  return router.createUrlTree(["/landing"]);
};
