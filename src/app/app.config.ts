import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  inject,
} from "@angular/core";
import { provideRouter, withViewTransitions, Router } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { routes } from "./app.routes";
import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@core/services/supabase-client";

registerLocaleData(localeFr, "fr");
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          const router = inject(Router);
          const targetUrl = router.getCurrentNavigation()?.finalUrl;

          if (!targetUrl) return;

          // Optimisation : ignorer les transitions si seuls les fragments changent
          const config = {
            paths: "exact" as const,
            matrixParams: "exact" as const,
            fragment: "ignored" as const,
            queryParams: "ignored" as const,
          };

          if (router.isActive(targetUrl, config)) {
            transition.skipTransition();
            return;
          }

          // Ajouter des types de transition pour différents styles
          const toPath = to.url.join("/");
          const fromPath = from.url.join("/");

          if (toPath === "") {
            transition.types.add("slide-to-home");
          } else if (fromPath === "") {
            transition.types.add("slide-from-home");
          } else {
            transition.types.add("fade-transition");
          }
        },
      }),
    ),
    provideHttpClient(),
    { provide: SupabaseClient, useValue: supabase },
  ],
};
