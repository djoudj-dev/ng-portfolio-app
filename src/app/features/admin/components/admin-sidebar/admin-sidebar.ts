import { Component, ChangeDetectionStrategy, signal, computed, input, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface SidebarLink {
  label: string;
  route: string;
  icon: string;
  section?: 'navigation' | 'admin';
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay pour mobile -->
    @if (isOpen() && !isDesktop()) {
      <div
        class="fixed inset-0 bg-accent bg-opacity-50 z-40 transition-opacity duration-300"
        (click)="toggleSidebar()"
      ></div>
    }

    <!-- Sidebar -->
    <div
      [class]="sidebarClasses()"
      class="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background shadow-lg z-50"
    >
      <!-- Header -->
      <div [class]="headerContainerClasses()">
        <button
          (click)="toggleSidebar()"
          [class]="headerContentClasses()"
          [class.p-3]="isOpen()"
          [class.p-2]="!isOpen()"
          class="w-full hover:bg-primary/10 hover:shadow-md rounded-xl transition-all duration-300 cursor-pointer group"
          [attr.aria-label]="isOpen() ? 'Réduire la sidebar' : 'Étendre la sidebar'"
        >
          <img [ngSrc]="'/logo.svg'" alt="Logo" width="32" height="32" [class]="logoClasses()" />
          @if (isOpen()) {
            <span class="text-xl font-bold text-primary ml-3 tracking-wide"> Admin Panel </span>
          }
        </button>
      </div>

      <!-- Section Admin -->
      @if (adminLinks().length > 0) {
        <div class="flex-1 px-4 py-6 space-y-6">
          @if (isOpen()) {
            <div class="relative">
              <h3
                class="text-xs font-bold text-primary/80 uppercase tracking-widest mb-4 pl-2 relative"
              >
                <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >Administration</span
                >
                <div
                  class="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                ></div>
              </h3>
            </div>
          }
          <nav class="space-y-2">
            @for (link of adminLinks(); track link.route) {
              <a
                [routerLink]="link.route"
                [class]="linkClasses()"
                class="group flex items-center relative overflow-hidden transition-all duration-300 hover:translate-x-1"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"
                ></div>
                <div class="relative z-10 flex items-center w-full">
                  <div
                    class="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/15 flex items-center justify-center transition-colors duration-300"
                  >
                    <img
                      [ngSrc]="'/icons/' + link.icon + '.svg'"
                      [alt]="link.label"
                      width="20"
                      height="20"
                      class="w-5 h-5 flex-shrink-0 icon-invert group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  @if (isOpen()) {
                    <span
                      class="ml-4 text-text text-sm font-semibold group-hover:text-primary transition-colors duration-300"
                      >{{ link.label }}</span
                    >
                    <div
                      class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <div
                        class="w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-full"
                      ></div>
                    </div>
                  } @else {
                    <div class="sidebar-tooltip z-20">{{ link.label }}</div>
                  }
                </div>
              </a>
            }
          </nav>
        </div>
      }
    </div>

    <!-- Footer - User Info -->
    <div class="mt-auto border-t border-primary/20 p-4 bg-gradient-to-r from-primary/5 to-accent/5">
      <div
        [class]="userInfoClasses()"
        class="group hover:bg-primary/10 rounded-xl p-3 transition-all duration-300 cursor-pointer"
      >
        <div class="relative">
          <div
            class="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md"
          >
            <span class="text-white text-sm font-bold">A</span>
          </div>
          <div
            class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background"
          ></div>
        </div>
        @if (isOpen()) {
          <div class="ml-3 min-w-0 flex-1">
            <p
              class="text-sm font-bold text-text truncate group-hover:text-primary transition-colors duration-300"
            >
              Admin
            </p>
            <p class="text-xs text-text/70 truncate">
              {{ userEmail() }}
            </p>
          </div>
          <div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="w-2 h-2 bg-primary rounded-full"></div>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    @reference "tailwindcss";

    .sidebar-tooltip {
      @apply absolute left-[3.5rem] bg-[#111827] text-white text-xs rounded py-1 px-2 opacity-0 pointer-events-none transition-opacity duration-200;
    }

    .group:hover .sidebar-tooltip {
      @apply opacity-100;
    }
  `,
})
export class AdminSidebar {
  readonly userEmail = input<string>('');
  readonly sidebarToggled = output<boolean>();

  private readonly _isOpen = signal(true);
  private readonly _isDesktop = signal(window.innerWidth >= 768);

  readonly isOpen = computed(() => this._isOpen());
  readonly isDesktop = computed(() => this._isDesktop());

  readonly adminLinks = signal<SidebarLink[]>([
    { label: 'Dashboard', route: '/admin', icon: 'stats', section: 'admin' },
    { label: 'CV', route: '/admin/cv', icon: 'cv', section: 'admin' },
    { label: 'Badges', route: '/admin/badges', icon: 'badge', section: 'admin' },
    { label: 'Utilisateurs', route: '/admin/users', icon: 'users', section: 'admin' },
    { label: 'Projets', route: '/admin/projects', icon: 'project', section: 'admin' },
    { label: 'Compétences', route: '/admin/skills', icon: 'stack', section: 'admin' },
    { label: 'Paramètres', route: '/admin/settings', icon: 'settings', section: 'admin' },
  ]);

  readonly sidebarClasses = computed(() => {
    const baseClasses = 'flex flex-col';
    const widthClasses = this.isOpen() ? 'w-64' : 'w-20';
    const mobileClasses =
      !this.isDesktop() && !this.isOpen() ? 'translate-x-full' : 'translate-x-0';

    return `${baseClasses} ${widthClasses} ${mobileClasses}`;
  });

  readonly headerContentClasses = computed(() => {
    return this.isOpen() ? 'flex items-center' : 'flex justify-center';
  });

  readonly linkClasses = computed(() => {
    const baseClasses = 'px-3 py-2 rounded-lg text-text hover:bg-background hover:text-text';
    const paddingClasses = this.isOpen() ? '' : 'justify-center';

    return `${baseClasses} ${paddingClasses}`;
  });

  readonly userInfoClasses = computed(() => {
    return this.isOpen() ? 'flex items-center' : 'flex justify-center';
  });

  readonly logoClasses = computed(() => {
    const baseClasses = 'flex-shrink-0 transition-transform duration-300';
    const sizeClasses = 'w-10 h-10';
    const hoverClasses = 'group-hover:scale-110';

    return `${baseClasses} ${sizeClasses} ${hoverClasses}`;
  });

  readonly headerContainerClasses = computed(() => {
    const baseClasses = 'border-b border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5';
    const paddingClasses = this.isOpen() ? 'p-6' : 'p-2';
    
    return `${baseClasses} ${paddingClasses}`;
  });


  constructor() {
    // Listen to window resize
    window.addEventListener('resize', () => {
      this._isDesktop.set(window.innerWidth >= 768);

      // Auto-close sidebar on mobile
      if (!this.isDesktop()) {
        this._isOpen.set(false);
      }
    });
  }

  toggleSidebar(): void {
    this._isOpen.update((current) => !current);
    this.sidebarToggled.emit(this._isOpen());
  }
}
