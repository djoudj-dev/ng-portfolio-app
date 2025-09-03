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
import { AuthService } from '@core/services/auth';
import { ButtonComponent } from '@shared/ui/button/button';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [NgOptimizedImage, RouterLink, ButtonComponent],
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

  readonly showLogin = output<void>();
  readonly logoutCompleted = output<void>();

  readonly navLinks = signal<NavLink[]>([
    { label: 'Accueil', route: '/', icon: 'home' },
    { label: 'À propos', route: '/about', icon: 'about' },
    { label: 'Compétences', route: '/skills', icon: 'stack' },
    { label: 'Projets', route: '/projects', icon: 'project' },
    { label: 'Contact', route: '/contact', icon: 'contact' },
  ]);

  private readonly _isDarkMode = signal(false);
  private readonly _isMobileMenuOpen = signal(false);
  private readonly _currentRoute = signal('/');

  readonly isDarkMode = computed(() => this._isDarkMode());
  readonly isLoggedIn = computed(() => this.authService.isAuthenticated());
  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly isMobileMenuOpen = computed(() => this._isMobileMenuOpen());

  readonly themeIcon = computed(() => ({
    src: this.isDarkMode() ? '/icons/sun.svg' : '/icons/moon.svg',
    alt: this.isDarkMode() ? 'Mode clair' : 'Mode sombre',
    class: this.isDarkMode() ? 'w-5 h-5 icon-invert' : 'w-5 h-5',
  }));

  readonly themeAriaLabel = computed(() =>
    this.isDarkMode() ? 'Activer le mode clair' : 'Activer le mode sombre',
  );

  readonly menuIcon = computed(() => ({
    src: this.isMobileMenuOpen() ? '/icons/close.svg' : '/icons/open.svg',
    alt: this.isMobileMenuOpen() ? 'Fermer menu' : 'Ouvrir menu',
    class: this.isDarkMode() ? 'w-6 h-6 icon-invert' : 'w-6 h-6',
  }));

  readonly menuAriaLabel = computed(() =>
    this.isMobileMenuOpen() ? 'Fermer le menu' : 'Ouvrir le menu',
  );

  constructor() {
    this.initializeTheme();

    this._currentRoute.set(this.router.url);

    this.router.events.subscribe(() => {
      this._currentRoute.set(this.router.url);
    });
  }

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

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.logoutCompleted.emit();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erreur de déconnexion:', error);
      },
    });
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  toggleMobileMenu(): void {
    this._isMobileMenuOpen.update((current) => !current);
  }

  closeMobileMenu(): void {
    this._isMobileMenuOpen.set(false);
  }

  isActiveRoute(route: string): boolean {
    return this._currentRoute() === route;
  }

  downloadCV(): void {
    const link = document.createElement('a');
    link.href = `${environment.apiUrl}/cv/download`;
    link.target = '_blank';
    link.download = 'CV-Julien-NEDELLEC.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
