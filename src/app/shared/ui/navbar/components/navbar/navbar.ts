import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { ButtonDarkMode } from "@shared/ui/button/button-dark-mode/button-dark-mode";
import { NAVIGATION_ITEMS } from "../../constants/navlink-constant";
import { ButtonComponent } from "@shared/ui/button/button";
import { LoginModalComponent } from "@shared/ui/login/login-modal/login-modal";
import { NavbarMobile } from "@shared/ui/navbar/components/navbar-mobile/navbar-mobile";
import { SupabaseService } from "@core/services/supabase-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-navbar",
  imports: [
    NgOptimizedImage,
    ButtonDarkMode,
    ButtonComponent,
    LoginModalComponent,
    NavbarMobile,
  ],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  navigationItems = NAVIGATION_ITEMS;
  private readonly router = inject(Router);
  readonly supabaseService = inject(SupabaseService);
  readonly isLoginModalOpen = signal(false);
  private readonly toastService = inject(ToastService);

  onNavigationClick(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  logout(): void {
    this.supabaseService.signOut();
  }

  navigateToAdmin(): void {
    this.router.navigate(["/admin/dashboard"]);
  }

  async downloadCv(): Promise<void> {
    // Allow anyone to download the admin's CV
    const adminUserId = "a7c8d5e2-5917-49b0-85df-40ed042e0d90"; // Replace with the actual admin user ID

    const publicUrl = await this.supabaseService.downloadCV(adminUserId);

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
