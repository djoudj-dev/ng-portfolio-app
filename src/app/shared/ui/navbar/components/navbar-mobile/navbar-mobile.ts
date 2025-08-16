import { CommonModule, NgOptimizedImage } from "@angular/common";
import { Component, inject, signal, output } from "@angular/core";
import { NAVIGATION_ITEMS } from "@shared/ui/navbar/constants/navlink-constant";
import { SupabaseService } from "@core/services/supabase-service";
import { Router } from "@angular/router";
import { ClickOutsideBehaviorDirective } from "@shared/behaviors/click-outside";

@Component({
  selector: "app-navbar-mobile",
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: "./navbar-mobile.html",
  hostDirectives: [
    {
      directive: ClickOutsideBehaviorDirective,
      outputs: ["clickedOutside:menuClosed"],
    },
  ],
})
export class NavbarMobile {
  navigationItems = NAVIGATION_ITEMS;
  isMenuOpen = signal(false);
  readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);

  readonly openLoginModalRequest = output<void>();

  menuClosed() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  onNavigationClick(route?: string) {
    if (route) {
      this.router.navigate([route]);
    }
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
