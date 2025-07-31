import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
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
    provideRouter(routes),
    provideHttpClient(),
    { provide: SupabaseClient, useValue: supabase },
  ],
};
