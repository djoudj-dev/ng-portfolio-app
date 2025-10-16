import { Component, ChangeDetectionStrategy, signal, inject, effect, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavLink } from './interface/nav-link';
import { CvService } from '@features/cv/services/cv';
import { ToastService } from '@shared/ui/toast/service/toast-service';
import { SvgIcon } from '../icon-svg/icon-svg';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    class: 'block w-full',
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cvService = inject(CvService);
  private readonly toastService = inject(ToastService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly isScrolled = signal(false);
  protected readonly currentRoute = signal<string>('');
  private routeSub?: Subscription;

  readonly navLinks = signal<NavLink[]>([
    { label: 'Accueil', route: '/', icon: 'lucide:house' },
    { label: 'À propos', route: '/about', icon: 'lucide:user' },
    { label: 'Compétences', route: '/skills', icon: 'lucide:database' },
    { label: 'Projets', route: '/projects', icon: 'lucide:code' },
    { label: 'Contact', route: '/contact', icon: 'lucide:mail' },
    { label: 'Blog', route: '/blog', icon: 'lucide:notebook-pen' },
  ]);

  readonly isMobileMenuOpen = signal(false);

  constructor() {
    // Gestion du click en dehors du menu mobile
    effect(() => {
      const isMenuOpen = this.isMobileMenuOpen();

      if (isMenuOpen) {
        // Attacher l'écouteur quand le menu s'ouvre
        setTimeout(() => {
          document.addEventListener('click', this.handleDocumentClick);
        }, 0);
      } else {
        // Détacher l'écouteur quand le menu se ferme
        document.removeEventListener('click', this.handleDocumentClick);
      }
    });
  }

  private readonly handleDocumentClick = (event: Event): void => {
    const host = this.elementRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.onCloseMobileMenu();
    }
  };

  onToggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  onCloseMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  isActiveRoute = (route: string): boolean => {
    // Accueil actif uniquement sur la racine
    if (route === '/') {
      return this.currentRoute() === '/';
    }
    // Autres liens : supporte /contact et /contact/xyz
    return this.currentRoute().startsWith(route);
  };

  onWindowScroll(): void {
    this.isScrolled.set(globalThis?.window?.scrollY > 50);
  }

  async openCV(): Promise<void> {
    try {
      await this.cvService.openCvInNewTab();
    } catch (error) {
      console.error("Erreur lors de l'ouverture du CV:", error);
      this.toastService.danger(
        'CV indisponible',
        "Le CV est temporairement indisponible. Veuillez réessayer plus tard ou contacter l'administrateur.",
      );
    }
  }

  ngOnInit(): void {
    // Initialise la route courante
    this.currentRoute.set(this.router.url);
    // Abonnement aux changements de navigation
    this.routeSub = this.router.events.subscribe(() => {
      this.currentRoute.set(this.router.url);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    // Nettoyer l'écouteur de click si le composant est détruit
    document.removeEventListener('click', this.handleDocumentClick);
  }
}
