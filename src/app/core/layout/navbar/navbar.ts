import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CvService } from '@features/cv/services/cv';
import { ToastService } from '@shared/ui/toast/service/toast-service';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';
import { ClickOutside } from './directive/click-outside';
import { NAV_LINKS } from './constant/nav-link';
import { NavRouteService } from './service/nav-route';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, SvgIcon, ClickOutside],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styles: `
    :host {

      .nav-scrolled > div {
        box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1),
        0 8px 10px -6px rgb(0 0 0 / 0.1);
      }
    }
  `,
  host: {
    class: 'block w-full',
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class NavbarComponent {
  private readonly cvService = inject(CvService);
  private readonly toastService = inject(ToastService);
  private readonly navRouteService = inject(NavRouteService);

  protected readonly isScrolled = signal(false);

  readonly isActiveRoute = this.navRouteService.isActiveRoute;
  readonly navLinks = signal(NAV_LINKS);
  readonly isMobileMenuOpen = signal(false);

  onToggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  onCloseMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onWindowScroll(): void {
    this.isScrolled.set((globalThis?.window?.scrollY ?? 0) > 50);
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
}
