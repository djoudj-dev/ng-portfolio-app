import { Component, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@app/core/services/auth-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: "./login-form.html",
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  readonly loginSuccess = output<void>();
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

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
      await this.authService.signIn(
        credentials.email!,
        credentials.password!,
      );
      this.loginSuccess.emit();
      this.toastService.show({
        message: "Connexion réussie",
        type: "success"
      });
      this.router.navigate(["/admin/dashboard"]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.errorMessage.set(err.message);
        this.toastService.show({
          message: `Échec de connexion: ${err.message}`,
          type: "error",
          duration: 5000
        });
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
