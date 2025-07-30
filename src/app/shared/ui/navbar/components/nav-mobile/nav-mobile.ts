import { CommonModule, NgOptimizedImage } from "@angular/common";
import {
  Component,
  inject,
  signal,
  ElementRef,
  HostListener,
  output,
} from "@angular/core";
import { ScrollService } from "@core/services/scroll-service";
import { NAVIGATION_ITEMS } from "@shared/ui/navbar/constants/navlink.constant";
import { AuthService } from "@core/services/auth-service";
import { Router } from "@angular/router";

@Component({
  selector: "app-nav-mobile",
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: "./nav-mobile.html",
})
export class NavMobile {
  navigationItems = NAVIGATION_ITEMS;
  isMenuOpen = signal(false);
  private readonly scrollService = inject(ScrollService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);

  readonly openLoginModalRequest = output<void>();

  @HostListener("document:click", ["$event"])
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
    this.authService.signOut();
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
