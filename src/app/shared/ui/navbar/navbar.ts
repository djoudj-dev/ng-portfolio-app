import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavLink } from './interface/nav-link';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '[class.navbar-fixed]': 'true',
  },
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Events
  readonly showLogin = output<void>();
  readonly logoutCompleted = output<void>();

  // Navigation links with their corresponding icons
  readonly navLinks = signal<NavLink[]>([
    { label: 'Accueil', route: '/', icon: 'home' },
    { label: 'À propos', route: '/about', icon: 'about' },
    { label: 'Compétences', route: '/skills', icon: 'stack' },
    { label: 'Projets', route: '/projects', icon: 'project' },
    { label: 'Contact', route: '/contact', icon: 'contact' },
  ]);

  // State signals
  private readonly _isDarkMode = signal(false);
  private readonly _isMobileMenuOpen = signal(false);
  private readonly _currentRoute = signal('/');

  // Computed properties
  readonly isDarkMode = computed(() => this._isDarkMode());
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly isMobileMenuOpen = computed(() => this._isMobileMenuOpen());

  // Theme icon computed properties
  readonly themeIcon = computed(() => ({
    src: this.isDarkMode() ? '/icons/navbar/sun.svg' : '/icons/navbar/moon.svg',
    alt: this.isDarkMode() ? 'Mode clair' : 'Mode sombre',
    class: this.isDarkMode() ? 'w-5 h-5 icon-invert' : 'w-5 h-5',
  }));

  readonly themeAriaLabel = computed(() =>
    this.isDarkMode() ? 'Activer le mode clair' : 'Activer le mode sombre',
  );

  // Auth icon computed properties
  readonly authIcon = computed(() => ({
    src: this.isLoggedIn() ? '/icons/navbar/logout.svg' : '/icons/navbar/login.svg',
    alt: this.isLoggedIn() ? 'Déconnexion' : 'Connexion',
    class: this.isDarkMode() ? 'w-5 h-5 icon-invert' : 'w-5 h-5',
  }));

  readonly authAriaLabel = computed(() => (this.isLoggedIn() ? 'Se déconnecter' : 'Se connecter'));

  // Mobile menu icon computed properties
  readonly menuIcon = computed(() => ({
    src: this.isMobileMenuOpen() ? '/icons/navbar/close.svg' : '/icons/navbar/open.svg',
    alt: this.isMobileMenuOpen() ? 'Fermer menu' : 'Ouvrir menu',
    class: this.isDarkMode() ? 'w-6 h-6 icon-invert' : 'w-6 h-6',
  }));

  readonly menuAriaLabel = computed(() =>
    this.isMobileMenuOpen() ? 'Fermer le menu' : 'Ouvrir le menu',
  );

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();

    // Initialize current route
    this._currentRoute.set(this.router.url);

    // Listen to route changes
    this.router.events.subscribe(() => {
      this._currentRoute.set(this.router.url);
    });
  }

  // Theme management
  toggleTheme(): void {
    const newTheme = !this._isDarkMode();
    this._isDarkMode.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    this._isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
  }

  // Authentication management
  toggleAuth(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout().subscribe({
        next: () => {
          // Logout successful - state already updated in service
          this.logoutCompleted.emit();
        },
        error: (error) => {
          console.error('Erreur de déconnexion:', error);
        },
      });
    } else {
      // Emit event to show login form - to be handled by parent component
      this.showLoginForm();
    }
  }

  private showLoginForm(): void {
    this.showLogin.emit();
  }

  // Mobile menu management
  toggleMobileMenu(): void {
    this._isMobileMenuOpen.update((current) => !current);
  }

  closeMobileMenu(): void {
    this._isMobileMenuOpen.set(false);
  }

  // Route checking
  isActiveRoute(route: string): boolean {
    return this._currentRoute() === route;
  }
}
