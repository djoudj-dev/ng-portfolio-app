import { Component, ChangeDetectionStrategy, signal, inject, output, effect } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LoginRequest } from '@core/services/auth';
import { NgOptimizedImage } from '@angular/common';

interface LoginFormControls {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <img
            ngSrc="/logo.svg"
            alt="Logo Julien.N"
            width="64"
            height="64"
            class="mx-auto h-16 w-16"
            priority
          />
          <h2 class="mt-6 text-3xl font-bold text-text">Connexion Admin</h2>
          <p class="mt-2 text-sm text-secondary">Accédez à votre espace d'administration</p>
        </div>

        <!-- Form -->
        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="mt-8 space-y-6"
          [class.opacity-50]="authService.isLoading()"
        >
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-text mb-2">
              Adresse email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  ngSrc="/icons/login/email.svg"
                  alt="Email icon"
                  width="16"
                  height="16"
                  class="h-4 w-4 text-secondary"
                  [class.icon-invert]="isDarkMode()"
                />
              </div>
              <input
                id="email"
                formControlName="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-primary-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                       bg-background text-text placeholder-secondary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
                [class.border-red-500]="emailControl.invalid && emailControl.touched"
                placeholder="admin@example.com"
              />
            </div>
            @if (emailControl.invalid && emailControl.touched) {
              <div class="mt-2 text-sm text-red-600">
                @if (emailControl.hasError('required')) {
                  L'adresse email est obligatoire
                } @else if (emailControl.hasError('email')) {
                  Veuillez entrer une adresse email valide
                }
              </div>
            }
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-text mb-2">
              Mot de passe
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  ngSrc="/icons/login/password.svg"
                  alt="Password icon"
                  width="16"
                  height="16"
                  class="h-4 w-4 text-secondary"
                  [class.icon-invert]="isDarkMode()"
                />
              </div>
              <input
                id="password"
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-12 py-3 border border-primary-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent
                       bg-background text-text placeholder-secondary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200"
                [class.border-red-500]="passwordControl.invalid && passwordControl.touched"
                placeholder="••••••••"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                [disabled]="authService.isLoading()"
                [attr.aria-label]="
                  showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                "
              >
                <img
                  [ngSrc]="showPassword() ? '/icons/login/eye-off.svg' : '/icons/login/eye.svg'"
                  [alt]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                  width="16"
                  height="16"
                  class="h-4 w-4 text-secondary hover:text-text transition-colors"
                  [class.icon-invert]="isDarkMode()"
                />
              </button>
            </div>
            @if (passwordControl.invalid && passwordControl.touched) {
              <div class="mt-2 text-sm text-red-600">
                @if (passwordControl.hasError('required')) {
                  Le mot de passe est obligatoire
                } @else if (passwordControl.hasError('minlength')) {
                  Le mot de passe doit contenir au moins 6 caractères
                }
              </div>
            }
          </div>

          <!-- Error Message -->
          @if (authService.error()) {
            <div
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
              role="alert"
              aria-live="polite"
            >
              <img
                ngSrc="/icons/login/warning.svg"
                alt="Erreur"
                width="16"
                height="16"
                class="h-4 w-4 flex-shrink-0"
              />
              <span class="text-sm">{{ authService.error() }}</span>
              <button
                type="button"
                (click)="authService.clearError()"
                class="ml-auto text-red-500 hover:text-red-700"
                aria-label="Fermer le message d'erreur"
              >
                <img
                  ngSrc="/icons/login/close.svg"
                  alt="Fermer"
                  width="12"
                  height="12"
                  class="h-3 w-3"
                />
              </button>
            </div>
          }

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              [disabled]="loginForm.invalid || authService.isLoading()"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent
                     text-sm font-medium rounded-lg text-white bg-accent hover:bg-accent-600
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
            >
              @if (authService.isLoading()) {
                <div class="flex items-center space-x-2">
                  <div
                    class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  ></div>
                  <span>Connexion en cours...</span>
                </div>
              } @else {
                <div class="flex items-center space-x-2">
                  <img
                    ngSrc="/icons/login/login.svg"
                    alt="Se connecter"
                    width="16"
                    height="16"
                    class="h-4 w-4"
                  />
                  <span>Se connecter</span>
                </div>
              }
            </button>
          </div>
        </form>

        <!-- Close Button -->
        <div class="text-center">
          <button
            type="button"
            (click)="closeLogin()"
            class="inline-flex items-center px-4 py-2 text-sm text-secondary hover:text-text
                   transition-colors duration-200"
            [disabled]="authService.isLoading()"
          >
            <img
              ngSrc="/icons/login/arrow-left.svg"
              alt="Retour"
              width="16"
              height="16"
              class="mr-2 h-4 w-4"
              [class.icon-invert]="isDarkMode()"
            />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  `,
  host: {
    '[class.login-form-container]': 'true',
  },
})
export class LoginForm {
  readonly authService = inject(AuthService);

  // Signaux pour l'état local du composant
  private readonly _showPassword = signal(false);
  private readonly _isDarkMode = signal(false);

  // Signaux publics
  readonly showPassword = this._showPassword.asReadonly();
  readonly isDarkMode = this._isDarkMode.asReadonly();

  // Événements
  readonly loginSuccess = output<void>();
  readonly loginCancel = output<void>();

  // Formulaire typé avec validation
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

  // Accès facile aux contrôles
  get emailControl() {
    return this.loginForm.controls.email;
  }
  get passwordControl() {
    return this.loginForm.controls.password;
  }

  constructor() {
    // Initialiser le thème depuis le DOM
    this.initializeTheme();

    // Écouter les changements de thème
    this.watchThemeChanges();

    // Gérer l'état disabled des contrôles basé sur le loading state
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
        // L'erreur est déjà gérée dans le service via tap
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
    // Observer les changements d'attribut data-theme
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
