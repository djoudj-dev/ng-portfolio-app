import { Injectable, signal, computed, inject } from "@angular/core";
import { supabase } from "@core/services/supabase-client";
import { User } from "@supabase/supabase-js";
import { Router } from "@angular/router";

export interface UserProfile {
  id: string;
  created_at: string;
  updated_at: string;
  username: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly userSignal = signal<User | null>(null);
  private readonly userProfileSignal = signal<UserProfile | null>(null);
  private readonly router = inject(Router);

  public readonly user = computed(() => this.userSignal());
  public readonly userProfile = computed(() => this.userProfileSignal());
  public readonly isAdmin = computed(
    () => this.userProfile()?.role === "admin",
  );

  constructor() {
    this.initialize();
  }

  private async initialize() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return;
    }

    this.userSignal.set(data.session?.user ?? null);
    if (data.session?.user) {
      await this.fetchUserProfile(data.session.user.id);
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.userSignal.set(session?.user ?? null);
      if (session?.user) {
        await this.fetchUserProfile(session.user.id);
      } else {
        this.userProfileSignal.set(null);
      }
    });
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      await this.fetchUserProfile(data.user.id);
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.userProfileSignal.set(null);
    await this.router.navigate(['/home']);
  }

  private async fetchUserProfile(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération du profil utilisateur", error);
      this.userProfileSignal.set(null);
      return;
    }
    this.userProfileSignal.set(data as UserProfile);
  }
}
