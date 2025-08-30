import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { ButtonDarkMode } from "@shared/ui/button/button-dark-mode/button-dark-mode";
import { NAVIGATION_ITEMS } from "./constants/navlink-constant";
import { ButtonComponent } from "@shared/ui/button/button";
import { LoginModalComponent } from "@features/auth/login/login-modal/login-modal";
import { AuthService } from "@core/services/auth-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import { CvService } from "@features/cv/services/cv-service";
import { ClickOutsideBehaviorDirective } from "./directives/click-outside";

@Component({
  selector: "app-navbar",
  imports: [
    NgOptimizedImage,
    ButtonDarkMode,
    ButtonComponent,
    LoginModalComponent,
    ClickOutsideBehaviorDirective,
  ],
  template: `
    <!-- Main Navigation Bar -->
    <nav
      class="fixed top-0 left-0 z-50 w-full bg-background shadow-accent shadow-xs"
      aria-label="Navigation principale"
    >
      <div class="px-4 mx-auto max-w-7xl lg:px-8 sm:px-6">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <button
              (click)="onNavigationClick('/')"
              class="flex items-center text-2xl font-bold hover:text-accent text-primary"
            >
              <img
                ngSrc="/logo.svg"
                alt="Julien.N"
                class="w-16 h-16 text-primary"
                width="40"
                height="40"
              />
              <span class="text-2xl font-bold text-text"
                >Julien<span class="bouncing-dot text-accent">.</span>N</span
              >
            </button>
          </div>

          <!-- Desktop Navigation Menu -->
          <div class="hidden justify-center items-center flex-1 md:flex">
            <ul class="flex space-x-4" role="list">
              @for (item of navigationItems; track item.label) {
                <li>
                  <a
                    (click)="onNavigationClick(item.route)"
                    [attr.href]="item.route"
                    class="flex relative items-center space-x-2 font-bold group hover:text-accent text-text underline-animated"
                    role="button"
                    tabindex="0"
                  >
                    <img
                      [ngSrc]="item.icon"
                      alt="Icône {{ item.label }}"
                      class="mb-1 w-5 h-5 icon-invert"
                      width="20"
                      height="20"
                    />
                    <span>{{ item.label }}</span>
                  </a>
                </li>
              }
            </ul>
          </div>

          <!-- Actions Section -->
          <div class="flex items-center space-x-4">
            <!-- Desktop Actions -->
            <div class="hidden items-center space-x-4 md:flex">
              <!-- CV Download Button -->
              <a (click)="downloadCv()">
                <app-button
                  color="accent"
                  aria-label="Télécharger CV"
                  [customClass]="
                    'px-2 sm:px-3 py-1 sm:py-2 shadow-md hover:shadow-lg transition-all duration-200'
                  "
                >
                  <div class="flex justify-center items-center gap-2 sm:gap-3">
                    <figure class="relative flex-shrink-0 w-4 h-4 sm:h-5 sm:w-5">
                      <img
                        [ngSrc]="'/icons/download.svg'"
                        alt="Icône de download"
                        class="object-contain absolute inset-0 w-full h-full icon-invert"
                        width="20"
                        height="20"
                      />
                    </figure>
                    <span class="text-xs font-medium sm:text-sm text-text">Mon CV</span>
                  </div>
                </app-button>
              </a>

              <!-- Dark Mode Toggle -->
              <app-button-dark-mode />

              <!-- Authentication Buttons -->
              @if (!authService.user()) {
                <button
                  (click)="openLoginModal()"
                  class="p-2 rounded-lg bg-background hover:bg-accent group"
                >
                  <img
                    ngSrc="/icons/login.svg"
                    alt="Login"
                    class="w-6 h-6 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 icon-invert"
                    width="24"
                    height="24"
                  />
                </button>
              } @else {
                <button
                  (click)="navigateToAdmin()"
                  class="p-2 rounded-lg bg-background hover:bg-accent group"
                >
                  <img
                    ngSrc="/icons/admin.svg"
                    alt="Admin"
                    class="w-6 h-6 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 icon-invert"
                    width="24"
                    height="24"
                  />
                </button>
                <button
                  (click)="logout()"
                  class="p-2 rounded-lg bg-background hover:bg-accent group"
                >
                  <img
                    ngSrc="/icons/logout.svg"
                    alt="Logout"
                    class="w-6 h-6 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 icon-invert"
                    width="24"
                    height="24"
                  />
                </button>
              }
            </div>

            <!-- Mobile Actions -->
            <div class="flex items-center gap-2 md:hidden">
              <!-- CV Download Button (Mobile) -->
              <a (click)="downloadCv()">
                <app-button
                  color="accent"
                  aria-label="Télécharger CV"
                  [customClass]="'px-2 py-1 shadow-md hover:shadow-lg transition-all duration-200'"
                >
                  <div class="flex justify-center items-center gap-1">
                    <img
                      [ngSrc]="'/icons/download.svg'"
                      alt="CV"
                      class="w-4 h-4 icon-invert"
                      width="16"
                      height="16"
                    />
                    <span class="text-xs font-medium text-text">CV</span>
                  </div>
                </app-button>
              </a>

              <!-- Dark Mode Toggle (Mobile) -->
              <app-button-dark-mode />

              <!-- Mobile Menu Button -->
              <div
                class="relative"
                appClickOutside
                (clickedOutside)="closeMobileMenu()"
              >
                <button
                  (click)="toggleMobileMenu()"
                  class="group relative inline-flex justify-center items-center p-3 rounded-xl bg-gradient-to-br from-background via-background/90 to-background/70 shadow-lg shadow-accent/10 border border-accent/20 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/50 hover:shadow-xl hover:shadow-accent/20 hover:border-accent/40 hover:scale-105 text-text min-h-[44px] min-w-[44px] active:scale-95"
                  [attr.aria-expanded]="isMobileMenuOpen()"
                  aria-label="Menu principal"
                >
                <span class="sr-only">{{ isMobileMenuOpen() ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>

                <!-- Shine effect on hover -->
                <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <!-- Active indicator -->
                <div class="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full opacity-0 scale-0 transition-all duration-300" [class.opacity-100]="isMobileMenuOpen()" [class.scale-100]="isMobileMenuOpen()"></div>

                <div class="relative w-6 h-6 z-10">
                  @if (!isMobileMenuOpen()) {
                    <img
                      ngSrc="/icons/open.svg"
                      alt="Ouvrir le menu"
                      class="absolute inset-0 w-6 h-6 opacity-100 transition-all duration-500 ease-out rotate-0 scale-100 icon-invert group-hover:rotate-12 group-hover:scale-110"
                      height="24" width="24"
                    />
                  } @else {
                    <img
                      ngSrc="/icons/close.svg"
                      alt="Fermer le menu"
                      class="absolute inset-0 w-6 h-6 opacity-100 transition-all duration-500 ease-out rotate-180 scale-110 icon-invert animate-pulse"
                      height="24" width="24"
                    />
                  }
                </div>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Panel -->
      @if (isMobileMenuOpen()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 z-40 bg-black/30 backdrop-blur-md md:hidden" (click)="closeMobileMenu()"></div>

        <!-- Menu Panel -->
        <div class="absolute right-4 z-50 mt-3 w-80 sm:w-72 top-full">
          <div class="overflow-hidden relative z-50 border rounded-2xl shadow-2xl shadow-accent/20 transition-all duration-500 ease-out transform bg-gradient-to-br from-background via-background/98 to-background/95 backdrop-blur-xl border-accent/40">
            <!-- Luminous border -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/10 via-transparent to-accent/10 opacity-50"></div>

            <!-- Top shine effect -->
            <div class="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>

            <div class="py-2">
              <!-- Navigation Items -->
              @for (item of navigationItems; track item.label) {
                <button
                  (click)="onNavigationClick(item.route)"
                  class="group relative flex items-center px-5 py-4 mx-2 my-1 space-x-4 w-auto text-base font-medium text-left transition-all duration-300 ease-out hover:text-accent hover:bg-gradient-to-r hover:from-accent/15 hover:via-accent/10 hover:to-accent/5 text-text min-h-[52px] rounded-xl hover:shadow-lg hover:shadow-accent/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <!-- Focus/hover indicator -->
                  <div class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-0 bg-accent rounded-full transition-all duration-300 group-hover:h-8 opacity-0 group-hover:opacity-100"></div>

                  <div class="relative z-10 flex items-center space-x-4 w-full">
                    <div class="relative">
                      <img
                        [ngSrc]="item.icon"
                        [alt]="item.altText"
                        class="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 icon-invert drop-shadow-sm"
                        width="24"
                        height="24"
                      />
                      <!-- Luminous halo around icon -->
                      <div class="absolute inset-0 w-6 h-6 bg-accent/20 rounded-full scale-0 opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-100 blur-md -z-10"></div>
                    </div>

                    <span class="flex-1 transition-all duration-300 group-hover:translate-x-1">{{ item.label }}</span>

                    <!-- Arrow indicator -->
                    <div class="w-0 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100 text-accent">
                      <img [ngSrc]="'/icons/chevron_right.svg'" alt="Arrow" class="w-4 h-4" width="24" height="24" />
                    </div>
                  </div>
                </button>
              }

              <!-- Divider -->
              <div class="mx-4 my-3 border-t border-gradient-to-r from-accent/20 via-accent/40 to-accent/20"></div>

              <!-- Authentication Section -->
              @if (!authService.user()) {
                <button
                  (click)="openLoginModal()"
                  class="group relative flex items-center px-5 py-4 mx-2 my-1 space-x-4 w-auto text-base font-medium text-left transition-all duration-300 ease-out hover:text-accent hover:bg-gradient-to-r hover:from-green-500/15 hover:via-green-500/10 hover:to-green-500/5 text-text min-h-[52px] rounded-xl hover:shadow-lg hover:shadow-green-500/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-0 bg-green-500 rounded-full transition-all duration-300 group-hover:h-8 opacity-0 group-hover:opacity-100"></div>

                  <div class="relative z-10 flex items-center space-x-4 w-full">
                    <div class="relative">
                      <img
                        ngSrc="/icons/login.svg"
                        alt="Login"
                        class="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 icon-invert drop-shadow-sm"
                        width="24"
                        height="24"
                      />
                      <div class="absolute inset-0 w-6 h-6 bg-green-500/20 rounded-full scale-0 opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-100 blur-md -z-10"></div>
                    </div>

                    <span class="flex-1 transition-all duration-300 group-hover:translate-x-1">Connexion</span>

                    <div class="w-0 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100 text-green-500">
                      <img ngSrc="/icons/chevron_right.svg" alt="Arrow" class="w-4 h-4" width="16" height="16" />
                    </div>
                  </div>
                </button>
              } @else {
                <button
                  (click)="navigateToAdmin()"
                  class="group relative flex items-center px-5 py-4 mx-2 my-1 space-x-4 w-auto text-base font-medium text-left transition-all duration-300 ease-out hover:text-accent hover:bg-gradient-to-r hover:from-blue-500/15 hover:via-blue-500/10 hover:to-blue-500/5 text-text min-h-[52px] rounded-xl hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-full transition-all duration-300 group-hover:h-8 opacity-0 group-hover:opacity-100"></div>

                  <div class="relative z-10 flex items-center space-x-4 w-full">
                    <div class="relative">
                      <img
                        ngSrc="/icons/admin.svg"
                        alt="Admin"
                        class="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 icon-invert drop-shadow-sm"
                        width="24"
                        height="24"
                      />
                      <div class="absolute inset-0 w-6 h-6 bg-blue-500/20 rounded-full scale-0 opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-100 blur-md -z-10"></div>
                    </div>

                    <span class="flex-1 transition-all duration-300 group-hover:translate-x-1">Admin</span>

                    <div class="w-0 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100 text-blue-500">
                      <img ngSrc="/icons/settings.svg" alt="Settings" class="w-4 h-4" width="16" height="16" />
                    </div>
                  </div>
                </button>

                <button
                  (click)="logout()"
                  class="group relative flex items-center px-5 py-4 mx-2 my-1 space-x-4 w-auto text-base font-medium text-left transition-all duration-300 ease-out hover:text-red-400 hover:bg-gradient-to-r hover:from-red-500/15 hover:via-red-500/10 hover:to-red-500/5 text-text min-h-[52px] rounded-xl hover:shadow-lg hover:shadow-red-500/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-0 bg-red-500 rounded-full transition-all duration-300 group-hover:h-8 opacity-0 group-hover:opacity-100"></div>

                  <div class="relative z-10 flex items-center space-x-4 w-full">
                    <div class="relative">
                      <img
                        ngSrc="/icons/logout.svg"
                        alt="Logout"
                        class="w-6 h-6 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 icon-invert drop-shadow-sm"
                        width="24"
                        height="24"
                      />
                      <div class="absolute inset-0 w-6 h-6 bg-red-500/20 rounded-full scale-0 opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-100 blur-md -z-10"></div>
                    </div>

                    <span class="flex-1 transition-all duration-300 group-hover:translate-x-1">Déconnexion</span>

                    <div class="w-0 opacity-0 transition-all duration-300 group-hover:w-4 group-hover:opacity-100 text-red-400">
                      <img ngSrc="/icons/chevron_right.svg" alt="Arrow" class="w-4 h-4" width="16" height="16" />
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      }
    </nav>

    <!-- Login Modal -->
    @if (isLoginModalOpen()) {
      <app-login-modal (closeModal)="closeLoginModal()" />
    }
  `,
  styles: `
    .underline-animated::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 0;
      background-color: var(--color-accent);
      transition: width 0.3s ease-in-out;
    }

    .underline-animated:hover::after {
      width: 100%;
    }

    .bouncing-dot {
      animation: bounce 0.5s ease infinite;
      display: inline-block;
    }

    @keyframes bounce {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  navigationItems = NAVIGATION_ITEMS;
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly isLoginModalOpen = signal(false);
  readonly isMobileMenuOpen = signal(false);
  private readonly toastService = inject(ToastService);
  private readonly cvService = inject(CvService);

  onNavigationClick(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
    this.closeMobileMenu();
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  navigateToAdmin(): void {
    this.router.navigate(["/admin/dashboard"]);
    this.closeMobileMenu();
  }

  async downloadCv(): Promise<void> {
    const { downloadCvFlow } = await import('@shared/utils/download-cv');
    await downloadCvFlow({
      cvService: this.cvService,
      toastService: this.toastService
    }, { onFinally: () => this.closeMobileMenu() });
  }
}
