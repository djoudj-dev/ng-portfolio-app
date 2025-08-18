import { inject } from "@angular/core";
import {
  CanActivateFn,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
} from "@angular/router";
import { SupabaseService } from "@core/services/supabase-service";

export type AccessLevel = "public" | "authenticated" | "admin" | "crud";

export const accessGuard = (requiredLevel: AccessLevel): CanActivateFn => {
  return (_route: ActivatedRouteSnapshot): boolean | UrlTree => {
    const supabase = inject(SupabaseService);
    const router = inject(Router);

    switch (requiredLevel) {
      case "public":
        return true;

      case "authenticated":
        if (supabase.user()) {
          return true;
        }
        console.warn("Accès refusé: utilisateur non authentifié");
        return router.createUrlTree(["/landing"], {
          queryParams: { message: "Connexion requise" },
        });

      case "admin":
        if (supabase.isAdmin()) {
          return true;
        }
        console.warn("Accès refusé: privilèges administrateur requis");
        return router.createUrlTree(["/landing"], {
          queryParams: { message: "Accès administrateur requis" },
        });

      case "crud":
        if (supabase.isAdmin()) {
          return true;
        }
        console.warn("Accès refusé: privilèges CRUD requis");
        return router.createUrlTree(["/"], {
          queryParams: { message: "Modification non autorisée" },
        });

      default:
        console.error("Niveau d'accès non reconnu:", requiredLevel);
        return router.createUrlTree(["/landing"]);
    }
  };
};

export const publicGuard = accessGuard("public");
export const authGuard = accessGuard("authenticated");
export const adminGuard = accessGuard("admin");
export const crudGuard = accessGuard("crud");
