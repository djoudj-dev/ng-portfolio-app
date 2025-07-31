import { Component, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@core/services/auth-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-login-form",
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-text"
          >Email</label
        >
        <input
          id="email"
          type="email"
          formControlName="email"
          autocomplete="email"
          required
          class="block px-3 py-2 mt-1 w-full border rounded-md shadow-sm bg-background border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-text"
          >Mot de passe</label
        >
        <input
          id="password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
          required
          class="block px-3 py-2 mt-1 w-full border rounded-md shadow-sm bg-background border-gray-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
        />
      </div>
      @if (errorMessage()) {
        <div class="text-sm text-red-500">{{ errorMessage() }}</div>
      }
      <app-button
        type="submit"
        color="primary"
        [disabled]="form.invalid || isLoading()"
        [isLoading]="isLoading()"
        [customClass]="'w-full py-3'"
      >
        Se connecter
      </app-button>
    </form>
  `,
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
      await this.authService.signIn(credentials.email!, credentials.password!);
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
