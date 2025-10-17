import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavLink } from '../interface/nav-link';
import { SvgIcon } from '../../icon-svg/icon-svg';
import { ClickOutside } from '../directive/click-outside';

@Component({
  selector: 'app-menu-mobile',
  imports: [RouterLink, SvgIcon, ClickOutside],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-mobile.html',
  host: {
    class: 'block w-full',
  },
})
export class MenuMobileComponent {

  readonly navLinks = input.required<NavLink[]>();
  readonly isOpen = input.required<boolean>();
  readonly isActiveRoute = input.required<(route: string) => boolean>();

  readonly menuToggle = output<void>();
  readonly menuClose = output<void>();
  readonly navigate = output<string>();

  readonly menuIcon = computed(() => ({
    name: this.isOpen() ? 'lucide:circle-x' : 'lucide:menu',
    ariaLabel: this.isOpen() ? 'Fermer la navigation' : 'Ouvrir la navigation',
  }));

  onToggle(): void {
    this.menuToggle.emit();
  }

  onNavigate(route: string): void {
    this.menuClose.emit();
    this.navigate.emit(route);
  }

}
