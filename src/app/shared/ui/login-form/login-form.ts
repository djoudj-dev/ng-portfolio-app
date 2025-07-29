import { Component, inject, output, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "@core/services/auth.service";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";

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
  readonly loginSuccess = output<void>();
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.form.getRawValue();

    this.authService
      .login({ email: credentials.email!, password: credentials.password! })
      .subscribe({
        next: () => {
          this.loginSuccess.emit();
          this.router.navigate(["/admin/dashboard"]); // ou une autre page protégée
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message || "An error occurred");
          this.isLoading.set(false);
        },
      });
  }
}
