import { Component, inject, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { ButtonDarkMode } from "@shared/ui/button-dark-mode/button-dark-mode";
import { NAVIGATION_ITEMS } from "./constant/navlink";
import { ButtonComponent } from "@shared/ui/button/button";
import { AuthService } from "@core/services/auth.service";
import { LoginModalComponent } from "../login-modal/login-modal";
import { ScrollService } from "@core/services/scroll-service";

@Component({
  selector: "app-navbar",
  imports: [
    NgOptimizedImage,
    RouterLink,
    ButtonDarkMode,
    ButtonComponent,
    LoginModalComponent,
  ],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.css",
})
export class Navbar {
  navigationItems = NAVIGATION_ITEMS;
  private readonly scrollService = inject(ScrollService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly isLoginModalOpen = signal(false);

  onNavigationClick(route: string | undefined, fragment?: string): void {
    const navigationRoute = route ?? "";
    if (navigationRoute) {
      this.router.navigateByUrl(navigationRoute).then(() => {
        if (fragment) {
          this.scrollService.scrollToSection(fragment);
        }
      });
    } else if (fragment) {
      this.scrollService.scrollToSection(fragment);
    }
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  navigateToAdmin(): void {
    this.router.navigate(["/admin/dashboard"]);
  }
}
