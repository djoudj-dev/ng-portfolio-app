import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "@environments/environment";

// Derive a per-tab storage key to avoid cross-tab Navigator Lock contention.
function getPerTabStorageKey(baseKey: string): string {
  try {
    const ss = (globalThis as unknown as { sessionStorage?: Storage })
      .sessionStorage;
    if (!ss) return baseKey;
    let tabId = ss.getItem("sb_tab_id");
    if (!tabId) {
      // Use crypto.randomUUID() when available, fallback to a simple random string.
      const anyGlobal = globalThis as unknown as { crypto?: Crypto };
      tabId =
        anyGlobal.crypto?.randomUUID?.() ??
        `tab-${Math.random().toString(36).slice(2, 10)}`;
      ss.setItem("sb_tab_id", tabId);
    }
    return `${baseKey}:${tabId}`;
  } catch {
    // In non-browser or restricted environments, fall back to the base key.
    return baseKey;
  }
}

// HMR-safe singleton Supabase client used across the app
const globalForSupabase = globalThis as unknown as {
  supabase?: SupabaseClient;
};

const STORAGE_KEY_BASE = "sb-ng-portfolio-auth";
const STORAGE_KEY = getPerTabStorageKey(STORAGE_KEY_BASE);

export const supabase: SupabaseClient =
  globalForSupabase.supabase ??
  (globalForSupabase.supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey,
    {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        storageKey: STORAGE_KEY,
      },
    },
  ));
