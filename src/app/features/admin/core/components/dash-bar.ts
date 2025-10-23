import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
    <nav class="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-accent shadow-lg shadow-primary/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo / Brand -->
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 ring-2 ring-primary/20 hover:scale-105 transition-transform duration-300">
              <app-svg-icon
                name="lucide:layout-dashboard"
                class="w-6 h-6 text-white"
                width="24"
                height="24"
              />
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl font-bold text-text bg-gradient-to-r from-primary to-accent bg-clip-text">
                Dashboard Admin
              </h1>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center gap-1.5">
            @for (item of navItems; track item.route) {
              <a
                [routerLink]="'/admin' + item.route"
                routerLinkActive="bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                [routerLinkActiveOptions]="{ exact: item.route === '' }"
                class="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-text hover:bg-accent hover:shadow-md transition-all duration-300 group border border-transparent hover:border-accent"
              >
                <app-svg-icon
                  [name]="item.icon"
                  class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                  width="20"
                  height="20"
                />
                <span class="hidden md:inline">{{ item.label }}</span>

                @if (item.badge) {
                  <span class="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 animate-pulse">
                    {{ item.badge }}
                  </span>
                }
              </a>
            }
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-3">

            <button
              (click)="onBack()"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 text-text transition-all duration-300 border border-accent/30 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 group"
              title="Retour"
            >
              <app-svg-icon
                name="streamline:return-2-remix"
                class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                width="20"
                height="20"
              />
              <span class="hidden lg:inline text-sm font-medium">Retour</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class DashBar {
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

  protected onBack(): void {
    history.back();
  }
}
