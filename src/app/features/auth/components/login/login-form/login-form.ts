import { Component, ChangeDetectionStrategy, signal, inject, output, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '@core/services/auth';
import { ButtonComponent } from '@shared/ui/button/button';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, ButtonComponent, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-auto flex items-center justify-center bg-background p-8">
      <div class="max-w-md w-full">
        <div class="text-center space-y-2 mb-6">
          <h2 class="text-3xl font-bold text-text">Connexion</h2>
          <p class="text-sm text-text">Accédez à votre espace d'administration</p>
        </div>

        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6"
          [class.opacity-60]="authService.isLoading()"
        >
          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-text/90">Adresse email</label>
            <div class="relative">
              <div class="absolute text-text inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <app-svg-icon name="lucide:mail" [width]="'20'" [height]="'20'" />
              </div>
              <input
                id="email"
                formControlName="email"
                type="email"
                autocomplete="email"
                placeholder="admin@example.com"
                class="block w-full pl-12 px-4 py-3 border-2 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                       text-text placeholder-secondary/60 bg-background/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sm input-focus"
                [class.border-primary-200]="!emailControl.invalid || !emailControl.touched"
                [class.hover:border-primary-300]="!emailControl.invalid || !emailControl.touched"
                [class.border-red-400]="emailControl.invalid && emailControl.touched"
                [class.focus:ring-red-200]="emailControl.invalid && emailControl.touched"
                [class.focus:border-red-400]="emailControl.invalid && emailControl.touched"
              />
            </div>
            @if (emailControl.invalid && emailControl.touched) {
              <div class="text-sm text-red-600 font-medium flex items-center gap-2">
                <app-svg-icon name="lucide:triangle-alert" [width]="'16'" [height]="'16'" />
                <span>
                  @if (emailControl.hasError('required')) {
                    L'adresse email est obligatoire
                  } @else if (emailControl.hasError('email')) {
                    Adresse email invalide
                  }
                </span>
              </div>
            }
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label for="password" class="block text-sm font-semibold text-text/90">Mot de passe</label>
            <div class="relative">
              <div class="absolute text-text inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <app-svg-icon name="lucide:lock-keyhole" [width]="'20'" [height]="'20'" />
              </div>
              <input
                id="password"
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="block w-full pl-12 pr-14 px-4 py-3 border-2 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
                       text-text placeholder-secondary/60 bg-background/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sm input-focus"
                [class.border-primary-200]="!passwordControl.invalid || !passwordControl.touched"
                [class.hover:border-primary-300]="!passwordControl.invalid || !passwordControl.touched"
                [class.border-red-400]="passwordControl.invalid && passwordControl.touched"
                [class.focus:ring-red-200]="passwordControl.invalid && passwordControl.touched"
                [class.focus:border-red-400]="passwordControl.invalid && passwordControl.touched"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                [disabled]="authService.isLoading()"
                [attr.aria-label]="showPassword() ? 'Masquer' : 'Afficher'"
                class="absolute inset-y-0 right-0 pr-4 flex items-center
                       text-text hover:text-accent transition-colors
                       focus:outline-none focus:text-accent"
              >
                <app-svg-icon
                  [name]="showPassword() ? 'lucide:eye-off' : 'lucide:eye'"
                  [width]="'18'"
                  [height]="'18'"
                />
              </button>
            </div>
            @if (passwordControl.invalid && passwordControl.touched) {
              <div class="text-sm text-red-600 font-medium flex items-center gap-2">
                <app-svg-icon name="lucide:triangle-alert" [width]="'16'" [height]="'16'" />
                <span>
                  @if (passwordControl.hasError('required')) {
                    Le mot de passe est obligatoire
                  } @else if (passwordControl.hasError('minlength')) {
                    Minimum 6 caractères
                  }
                </span>
              </div>
            }
          </div>

          <!-- Error -->
          @if (authService.error()) {
            <div
              class="bg-red-500/10 border-2 border-red-500/30 text-red-600
                     px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm"
              role="alert"
              aria-live="polite"
            >
              <app-svg-icon name="lucide:triangle-alert" [width]="'20'" [height]="'20'" [iconClass]="'w-5 h-5'" />
              <span class="flex-1">{{ authService.error() }}</span>
              <button
                type="button"
                (click)="authService.clearError()"
                class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-200 transition-colors"
                aria-label="Fermer"
              >
                <app-svg-icon name="lucide:circle-x" [width]="'16'" [height]="'16'" [iconClass]="'w-4 h-4'" />
              </button>
            </div>
          }

          <!-- Submit -->
          <app-button
            type="submit"
            color="accent"
            [disabled]="loginForm.invalid || authService.isLoading()"
            [isLoading]="authService.isLoading()"
            customClass="w-full py-4 text-base font-semibold rounded-xl shadow-lg"
            (buttonClick)="onSubmit()"
          >
            @if (authService.isLoading()) {
              <div class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent"></div>
                <span>Connexion...</span>
              </div>
            } @else {
              <div class="flex items-center justify-center gap-2">
                <app-svg-icon name="lucide:log-in" [width]="'20'" [height]="'20'" />
                <span>Se connecter</span>
              </div>
            }
          </app-button>
        </form>
      </div>
    </div>
  `,
  styles: `
    .input-focus:focus {
      transform: translateY(-1px);
    }
  `,
})
export class LoginForm {
  readonly authService = inject(AuthService);

  private readonly _showPassword = signal(false);
  readonly showPassword = this._showPassword.asReadonly();

  readonly loginSuccess = output<void>();
  readonly loginCancel = output<void>();

  readonly loginForm = new FormGroup<LoginFormControls>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  constructor() {
    effect(() => {
      if (this.authService.isLoading()) {
        this.loginForm.disable();
      } else {
        this.loginForm.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.authService.isLoading()) return;

    const credentials: LoginRequest = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
    };

    this.authService.login(credentials).subscribe({
      next: () => this.loginSuccess.emit(),
      error: (error) => console.error('Erreur de connexion:', error),
    });
  }

  togglePasswordVisibility(): void {
    this._showPassword.update((current) => !current);
  }
}
