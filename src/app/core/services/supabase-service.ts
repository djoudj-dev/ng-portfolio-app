import { Injectable, signal, computed, inject } from "@angular/core";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Router } from "@angular/router";
import { RateLimitService } from "@core/services/rate-limit-service";

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
}

@Injectable({ providedIn: "root" })
export class SupabaseService {
  private readonly client = inject(SupabaseClient);

  constructor() {
    void this.initialize();
  }

  private readonly userSignal = signal<User | null>(null);
  private readonly userProfileSignal = signal<UserProfile | null>(null);
  private readonly router = inject(Router);
  private readonly rateLimitService = inject(RateLimitService);

  readonly uploadStatus = signal<"idle" | "uploading" | "done" | "error">(
    "idle",
  );

  public readonly user = computed(() => this.userSignal());
  public readonly userProfile = computed(() => this.userProfileSignal());
  public readonly isAdmin = computed(
    () => this.userProfile()?.role === "admin",
  );
  get supabaseClient() {
    return this.client;
  }

  private async runWithLockRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 100,
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        const err = error as { name?: string };
        if (
          err?.name === "NavigatorLockAcquireTimeoutError" &&
          i < maxRetries - 1
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, baseDelayMs * (i + 1)),
          );
          continue;
        }
        throw error;
      }
    }
    // Should never reach here
    return await fn();
  }

  private async initialize() {
    const { data, error } = await this.runWithLockRetry(() =>
      this.client.auth.getSession(),
    );
    if (error) {
      return;
    }

    this.userSignal.set(data.session?.user ?? null);
    if (data.session?.user) {
      await this.fetchUserProfile(data.session.user.id);
    }

    this.client.auth.onAuthStateChange(async (_event, session) => {
      this.userSignal.set(session?.user ?? null);
      if (session?.user) {
        await this.fetchUserProfile(session.user.id);
      } else {
        this.userProfileSignal.set(null);
      }
    });
  }

  async signIn(email: string, password: string) {
    // Vérifier le rate limiting avant la tentative
    const rateLimitKey = `login_${email}`;
    if (!this.rateLimitService.checkRateLimit(rateLimitKey)) {
      const minutesRemaining = this.rateLimitService.getBlockTimeRemaining(rateLimitKey);
      throw new Error(
        `Trop de tentatives de connexion. Réessayez dans ${minutesRemaining} minute(s).`
      );
    }

    const { data, error } = await this.runWithLockRetry(() =>
      this.client.auth.signInWithPassword({
        email,
        password,
      }),
    );
    
    if (error) {
      // Connexion échouée - ne pas réinitialiser le rate limit
      throw error;
    }
    
    if (data.user) {
      // Connexion réussie - réinitialiser le rate limit
      this.rateLimitService.resetRateLimit(rateLimitKey);
      await this.fetchUserProfile(data.user.id);
    }
  }

  async signOut() {
    const { error } = await this.runWithLockRetry(() =>
      this.client.auth.signOut(),
    );
    if (error) throw error;
    // Clear local auth state immediately; onAuthStateChange will also run
    this.userSignal.set(null);
    this.userProfileSignal.set(null);
    await this.router.navigate(["/landing"]);
  }

  private async fetchUserProfile(userId: string): Promise<void> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur lors de la récupération du profil utilisateur",
        error,
      );
      this.userProfileSignal.set(null);
      return;
    }
    this.userProfileSignal.set(data as UserProfile);
  }

  async uploadCV(file: File, userId: string): Promise<string | null> {
    this.uploadStatus.set("uploading");

    const path = `${userId}/${file.name}`;
    const { error } = await this.client.storage
      .from("docs")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      this.uploadStatus.set("error");
      return null;
    }

    const { error: dbError } = await this.client.from("cv_path").upsert(
      {
        user_id: userId,
        file_path: path,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (dbError) {
      console.error(
        "Erreur lors de l'enregistrement du chemin du CV dans la base de données:",
        dbError,
      );
    }

    this.uploadStatus.set("done");
    return path;
  }

  async downloadCV(userId: string): Promise<string | null> {
    const { data: pathData, error: pathError } = await this.client
      .from("cv_path")
      .select("file_path")
      .eq("user_id", userId)
      .single();

    if (pathError || !pathData) {
      console.error(
        "Erreur lors de la récupération du chemin du CV depuis la base de données:",
        pathError,
      );
      return null;
    }

    const path = pathData.file_path as string;
    const { data: publicData } = this.client.storage
      .from("docs")
      .getPublicUrl(path);
    return publicData.publicUrl ?? null;
  }

  from(table: string) {
    return this.client.from(table);
  }

  storage() {
    return this.client.storage;
  }

  auth() {
    return this.client.auth;
  }
}
