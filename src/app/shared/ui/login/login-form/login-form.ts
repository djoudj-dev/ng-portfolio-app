import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
  computed,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { SupabaseService } from "@core/services/supabase-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import { SecurityService } from "@core/services/security-service";

@Component({
  selector: "app-login-form",
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: "./login-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly securityService = inject(SecurityService);
  
  readonly loginSuccess = output<void>();
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  
  // Computed pour l'état de rate limiting
  readonly isRateLimited = computed(() => this.securityService.isRateLimited());
  readonly rateLimitInfo = computed(() => {
    const email = this.form.get('email')?.value ?? '';
    return this.securityService.getBlockInfo(`login_${email}`);
  });

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.form.getRawValue();

    try {
      await this.supabaseService.signIn(
        credentials.email!,
        credentials.password!,
      );
      this.loginSuccess.emit();
      this.toastService.show({
        message: "Connexion réussie",
        type: "success",
      });
      this.router.navigate(["/admin/dashboard"]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message);
        this.toastService.show({
          message: `Échec de connexion: ${err.message}`,
          type: "error",
          duration: 5000,
        });
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
