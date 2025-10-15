import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  effect,
  inject,
  ElementRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavLink } from '../interface/nav-link';
import { SvgIcon } from '../../icon-svg/icon-svg';

@Component({
  selector: 'app-menu-mobile',
  imports: [RouterLink, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-mobile.html',
  host: {
    class: 'block w-full',
  },
})
export class MenuMobileComponent {
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  // Inputs modernes Angular 20+
  readonly navLinks = input.required<NavLink[]>();
  readonly isOpen = input.required<boolean>();
  readonly isActiveRoute = input.required<(route: string) => boolean>();

  // Outputs modernes Angular 20+
  readonly menuToggle = output<void>();
  readonly menuClose = output<void>();
  readonly navigate = output<string>();

  readonly menuIcon = computed(() => ({
    name: this.isOpen() ? 'lucide:circle-x' : 'lucide:menu',
    ariaLabel: this.isOpen() ? 'Fermer la navigation' : 'Ouvrir la navigation',
  }));

  constructor() {
    // Gestion moderne du click outside avec effect
    effect(() => {
      const isMenuOpen = this.isOpen();

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
    const host = this.hostRef.nativeElement;
    if (!host.contains(event.target as Node)) {
      this.menuClose.emit();
    }
  };

  onToggle(): void {
    this.menuToggle.emit();
  }

  onNavigate(route: string): void {
    this.menuClose.emit();
    this.navigate.emit(route);
  }
}
