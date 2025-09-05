import { Component, ChangeDetectionStrategy, signal, inject, output, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '@core/services/auth';
import { NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@shared/ui/button/button';

interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, NgOptimizedImage, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="min-h-160 flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div class="max-w-md w-full relative z-10">
        <div
          class="bg-background backdrop-blur-xl border border-accent rounded-3xl shadow-2xl shadow-primary-900/10 p-8 space-y-2 transform transition-all duration-300 hover:shadow-3xl hover:shadow-primary-900/15"
        >
          <div class="text-center space-y-4">
            <div class="relative mx-auto w-24 h-24 mb-6">
              <div
                class="absolute inset-0 bg-gradient-to-r from-accent to-accent-400 rounded-full opacity-20 animate-pulse scale-110"
              ></div>
              <div
                class="absolute inset-2 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full opacity-30 animate-spin-slow"
              ></div>
              <!-- Conteneur du logo -->
              <div
                class="relative bg-gradient-to-br from-background to-primary-50 rounded-full p-5 shadow-xl border border-primary-200/50 transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  ngSrc="/logo.svg"
                  alt="Logo Julien.N"
                  width="56"
                  height="56"
                  class="w-14 h-14"
                  priority
                />
              </div>
            </div>
            <div class="space-y-2">
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-text via-primary to-accent bg-clip-text text-transparent"
              >
                Connexion Admin
              </h2>
              <p class="text-sm text-secondary/80 font-medium">
                Accédez à votre espace d'administration
              </p>
            </div>
          </div>

          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
            [class.opacity-60]="authService.isLoading()"
          >
            <!-- Email Field avec design moderne -->
            <div class="space-y-2 pt-4">
              <label for="email" class="block text-sm font-semibold text-text/90">
                Adresse email
              </label>
              <div class="relative group">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                >
                  <img
                    ngSrc="/icons/email.svg"
                    alt="Email icon"
                    width="18"
                    height="18"
                    class="h-5 w-5 text-secondary/70 group-focus-within:text-accent transition-colors duration-200"
                    [class.icon-invert]="isDarkMode()"
                  />
                </div>
                <input
                  id="email"
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="block w-full pl-12 pr-4 py-4 border-2 border-primary-200/60 rounded-xl
                         focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent
                         bg-gradient-to-r from-background to-primary-50/30 text-text placeholder-secondary/60
                         disabled:opacity-50 disabled:cursor-not-allowed font-medium
                         transition-all duration-300 hover:border-primary-300
                         shadow-sm hover:shadow-md focus:shadow-lg"
                  [class.border-red-400]="emailControl.invalid && emailControl.touched"
                  [class.focus:ring-red-200]="emailControl.invalid && emailControl.touched"
                  [class.focus:border-red-400]="emailControl.invalid && emailControl.touched"
                  placeholder="admin@example.com"
                />
              </div>
              @if (emailControl.invalid && emailControl.touched) {
                <div class="mt-2 text-sm text-red-600 font-medium flex items-center space-x-1">
                  <img
                    ngSrc="/icons/warning.svg"
                    alt=""
                    width="14"
                    height="14"
                    class="h-3.5 w-3.5 flex-shrink-0"
                  />
                  <span>
                    @if (emailControl.hasError('required')) {
                      L'adresse email est obligatoire
                    } @else if (emailControl.hasError('email')) {
                      Veuillez entrer une adresse email valide
                    }
                  </span>
                </div>
              }
            </div>

            <!-- Password Field avec design moderne -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-text/90">
                Mot de passe
              </label>
              <div class="relative group">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"
                >
                  <img
                    ngSrc="/icons/password.svg"
                    alt="Password icon"
                    width="18"
                    height="18"
                    class="h-5 w-5 text-secondary/70 group-focus-within:text-accent transition-colors duration-200"
                    [class.icon-invert]="isDarkMode()"
                  />
                </div>
                <input
                  id="password"
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="block w-full pl-12 pr-14 py-4 border-2 border-primary-200/60 rounded-xl
                         focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent
                         bg-gradient-to-r from-background to-primary-50/30 text-text placeholder-secondary/60
                         disabled:opacity-50 disabled:cursor-not-allowed font-medium
                         transition-all duration-300 hover:border-primary-300
                         shadow-sm hover:shadow-md focus:shadow-lg"
                  [class.border-red-400]="passwordControl.invalid && passwordControl.touched"
                  [class.focus:ring-red-200]="passwordControl.invalid && passwordControl.touched"
                  [class.focus:border-red-400]="passwordControl.invalid && passwordControl.touched"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center z-10
                         text-secondary/70 hover:text-text transition-colors duration-200
                         focus:outline-none focus:text-accent"
                  [disabled]="authService.isLoading()"
                  [attr.aria-label]="
                    showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                  "
                >
                  <img
                    [ngSrc]="showPassword() ? '/icons/eye-off.svg' : '/icons/eye.svg'"
                    [alt]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                    width="18"
                    height="18"
                    class="h-5 w-5 transition-all duration-200"
                    [class.icon-invert]="isDarkMode()"
                  />
                </button>
              </div>
              @if (passwordControl.invalid && passwordControl.touched) {
                <div class="mt-2 text-sm text-red-600 font-medium flex items-center space-x-1">
                  <img
                    ngSrc="/icons/warning.svg"
                    alt=""
                    width="14"
                    height="14"
                    class="h-3.5 w-3.5 flex-shrink-0"
                  />
                  <span>
                    @if (passwordControl.hasError('required')) {
                      Le mot de passe est obligatoire
                    } @else if (passwordControl.hasError('minlength')) {
                      Le mot de passe doit contenir au moins 6 caractères
                    }
                  </span>
                </div>
              }
            </div>

            <!-- Error Message avec design moderne -->
            @if (authService.error()) {
              <div
                class="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center space-x-3 shadow-sm"
                role="alert"
                aria-live="polite"
              >
                <img
                  ngSrc="/icons/warning.svg"
                  alt="Erreur"
                  width="18"
                  height="18"
                  class="h-5 w-5 flex-shrink-0 text-red-600"
                />
                <span class="text-sm font-medium flex-1">{{ authService.error() }}</span>
                <button
                  type="button"
                  (click)="authService.clearError()"
                  class="text-red-500 hover:text-red-700 transition-colors duration-200 p-1 rounded-full hover:bg-red-200"
                  aria-label="Fermer le message d'erreur"
                >
                  <img
                    ngSrc="/icons/close.svg"
                    alt="Fermer"
                    width="14"
                    height="14"
                    class="h-3.5 w-3.5 icon-invert"
                  />
                </button>
              </div>
            }

            <!-- Submit Button avec design moderne -->
            <div class="pt-2">
              <app-button
                type="submit"
                color="accent"
                [disabled]="loginForm.invalid || authService.isLoading()"
                [isLoading]="authService.isLoading()"
                customClass="w-full py-4 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] focus:scale-[0.98]"
                (buttonClick)="onSubmit()"
              >
                @if (authService.isLoading()) {
                  <div class="flex items-center space-x-2">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent"
                    ></div>
                    <span>Connexion en cours...</span>
                  </div>
                } @else {
                  <div class="flex items-center justify-center space-x-2">
                    <img
                      ngSrc="/icons/login.svg"
                      alt="Se connecter"
                      width="18"
                      height="18"
                      class="h-5 w-5"
                    />
                    <span>Se connecter</span>
                  </div>
                }
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: `
    @keyframes spin-slow {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
    }

    input:focus {
      transform: translateY(-1px);
    }

    /* Gradient text fallback pour les navigateurs non supportés */
    @supports not (background-clip: text) {
    }
  `,
  host: {
    '[class.login-form-container]': 'true',
  },
})
export class LoginForm {
  readonly authService = inject(AuthService);

  private readonly _showPassword = signal(false);
  private readonly _isDarkMode = signal(false);

  readonly showPassword = this._showPassword.asReadonly();
  readonly isDarkMode = this._isDarkMode.asReadonly();

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
    this.initializeTheme();

    this.watchThemeChanges();

    effect(() => {
      const isLoading = this.authService.isLoading();
      if (isLoading) {
        this.emailControl.disable();
        this.passwordControl.disable();
      } else {
        this.emailControl.enable();
        this.passwordControl.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.authService.isLoading()) {
      return;
    }

    const credentials: LoginRequest = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loginSuccess.emit();
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
      },
    });
  }

  togglePasswordVisibility(): void {
    this._showPassword.update((current) => !current);
  }

  closeLogin(): void {
    this.loginCancel.emit();
  }

  private initializeTheme(): void {
    const isDark =
      document.documentElement.hasAttribute('data-theme') &&
      document.documentElement.getAttribute('data-theme') === 'dark';
    this._isDarkMode.set(isDark);
  }

  private watchThemeChanges(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          this._isDarkMode.set(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }
}
