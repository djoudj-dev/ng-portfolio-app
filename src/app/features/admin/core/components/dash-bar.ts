import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

interface NavItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly badge?: number;
}

@Component({
  selector: 'app-dash-bar',
  imports: [RouterLink, RouterLinkActive, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-primary/40 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Brand -->
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <app-svg-icon
                name="lucide:layout-dashboard"
                class="w-6 h-6 text-white"
                width="24"
                height="24"
              />
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold text-text">Dashboard Admin</h1>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center gap-2">
            @for (item of navItems; track item.route) {
              <a
                [routerLink]="'/admin' + item.route"
                routerLinkActive="bg-primary text-white shadow-md"
                [routerLinkActiveOptions]="{ exact: item.route === '' }"
                class="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text hover:bg-primary/10 transition-all duration-200 group"
              >
                <app-svg-icon
                  [name]="item.icon"
                  class="w-5 h-5 group-hover:scale-110 transition-transform"
                  width="20"
                  height="20"
                />
                <span class="hidden md:inline">{{ item.label }}</span>

                @if (item.badge) {
                  <span class="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {{ item.badge }}
                  </span>
                }
              </a>
            }
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex flex-col items-end">
              <span class="text-sm font-semibold text-text">{{ displayName }}</span>
              <span class="text-xs text-secondary">{{ userEmail() }}</span>
            </div>

            <button
              (click)="onLogout()"
              class="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
              title="Déconnexion"
            >
              <app-svg-icon
                name="lucide:log-out"
                class="w-5 h-5"
                width="20"
                height="20"
              />
              <span class="hidden lg:inline text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class DashBar {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly displayName = 'Julien NÉDELLEC';
  readonly currentUser = this.authService.user;

  readonly userEmail = computed(() => {
    return this.currentUser()?.email ?? 'admin@example.com';
  });

  readonly navItems: ReadonlyArray<NavItem> = [
    { label: 'Accueil', route: '', icon: 'lucide:home' },
    { label: 'Badges', route: '/badges', icon: 'lucide:badge' },
    { label: 'Messages', route: '/messages', icon: 'lucide:mail', badge: 0 },
    { label: 'CV', route: '/cv', icon: 'lucide:file-text' },
    { label: 'Projets', route: '/projects', icon: 'lucide:folder' },
    { label: 'Paramètres', route: '/settings', icon: 'lucide:settings' },
  ];

  protected onLogout(): void {
    console.log('Déconnexion...');
    void this.router.navigate(['/']);
  }
}
