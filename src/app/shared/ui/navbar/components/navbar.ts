import { Component, inject, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { ButtonDarkMode } from "@shared/ui/button-dark-mode/button-dark-mode";
import { NAVIGATION_ITEMS } from "../constants/navlink.constant";
import { ButtonComponent } from "@shared/ui/button/button";
import { AuthService } from "@core/services/auth-service";
import { LoginModalComponent } from "../../login-modal/login-modal";
import { ScrollService } from "@core/services/scroll-service";
import { NavMobile } from "@shared/ui/navbar/components/nav-mobile/nav-mobile";
import { SupabaseStorageService } from "@core/services/supabase-storage-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-navbar",
  imports: [
    NgOptimizedImage,
    RouterLink,
    ButtonDarkMode,
    ButtonComponent,
    LoginModalComponent,
    NavMobile,
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
  private readonly supabaseStorageService = inject(SupabaseStorageService);
  private readonly toastService = inject(ToastService);

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
    this.authService.signOut();
  }

  navigateToAdmin(): void {
    this.router.navigate(["/admin/dashboard"]);
  }

  async downloadCv(): Promise<void> {
    // Allow anyone to download the admin's CV
    const adminUserId = "a7c8d5e2-5917-49b0-85df-40ed042e0d90"; // Replace with the actual admin user ID

    const publicUrl = await this.supabaseStorageService.downloadCV(adminUserId);

    if (publicUrl) {
      window.open(publicUrl, "_blank");
      this.toastService.show({
        message: "Téléchargement du CV initié.",
        type: "success",
      });
    } else {
      this.toastService.show({
        message:
          "Échec du téléchargement du CV. Le fichier n'existe peut-être pas ou vous n'avez pas les permissions.",
        type: "error",
      });
    }
  }
}
