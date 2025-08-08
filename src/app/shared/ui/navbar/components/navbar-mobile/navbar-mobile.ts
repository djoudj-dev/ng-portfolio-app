import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  Component,
  inject,
  signal,
  ElementRef,
  output,
} from "@angular/core";
import { ScrollService } from "@core/services/scroll-service";
import { NAVIGATION_ITEMS } from "@shared/ui/navbar/constants/navlink-constant";
import { SupabaseService } from "@core/services/supabase.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-navbar-mobile",
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: "./navbar-mobile.html",
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class NavbarMobile {
  navigationItems = NAVIGATION_ITEMS;
  isMenuOpen = signal(false);
  private readonly scrollService = inject(ScrollService);
  readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly openLoginModalRequest = output<void>();

  onClick(event: MouseEvent) {
    if (
      this.isMenuOpen() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  onNavigationClick(fragment?: string) {
    this.scrollService.scrollToSection(fragment);
    this.closeMenu();
  }

  logout(): void {
    this.supabaseService.signOut();
    this.closeMenu();
  }

  navigateToAdmin(): void {
    this.router.navigate(["/admin/dashboard"]);
    this.closeMenu();
  }

  openLoginModal(): void {
    this.openLoginModalRequest.emit();
    this.closeMenu();
  }
}
