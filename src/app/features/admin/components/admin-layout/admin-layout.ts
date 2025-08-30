import {
  Component,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { Router, RouterOutlet, NavigationEnd } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";
import { SidebarComponent } from "./sidebar";
import { MobileOverlayComponent } from "./mobile-overlay";
import { Subscription } from "rxjs";
import { SidebarItem } from "@features/admin/models/sidebar-item";

@Component({
  selector: "app-admin-layout",
  imports: [
    RouterOutlet,
    NgOptimizedImage,
    SidebarComponent,
    MobileOverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./admin-layout.html",
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  // State signals
  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly activeSection = signal<string>("");
  readonly activeSubSection = signal<string>("");
  readonly windowWidth = signal(window.innerWidth);

  // Router injection moderne
  private readonly router = inject(Router);
  private routerSub?: Subscription;

  // Computed signals
  readonly isDesktop = computed(() => this.windowWidth() >= 1024);
  readonly isMobile = computed(() => this.windowWidth() < 1024);

  readonly shouldShowMobileOverlay = computed(
    () => this.sidebarOpen() && this.isMobile(),
  );

  readonly mainContentClasses = computed(() =>
    this.sidebarCollapsed() ? "lg:pl-16" : "lg:pl-64",
  );

  readonly currentSectionTitle = computed(() => {
    const activeId = this.activeSection();
    const section = this.sidebarItems.find((item) => item.id === activeId);
    return section?.label ?? "Dashboard";
  });
  onResize(event: Event): void {
    const target = event.target as Window;
    this.windowWidth.set(target.innerWidth);
    if (target.innerWidth >= 1024) {
      this.sidebarOpen.set(false);
    }
  }

  readonly sidebarItems: SidebarItem[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      icon: "/icons/grid.svg",
      route: "/admin/dashboard",
    },
    {
      id: "badges",
      label: "Badge",
      icon: "/icons/badge.svg",
      route: "/admin/badges",
    },
    {
      id: "cv",
      label: "CV",
      icon: "/icons/document.svg",
      route: "/admin/cv",
    },
    {
      id: "projects",
      label: "Projets",
      icon: "/icons/project.svg",
      route: "/admin/projects",
      children: [
        {
          id: "projects-list",
          label: "Liste des projets",
          icon: "/icons/list.svg",
          route: "/admin/projects",
        },
        {
          id: "projects-create",
          label: "Nouveau projet",
          icon: "/icons/plus.svg",
          route: "/admin/projects/create",
        },
      ],
    },
    {
      id: "contacts",
      label: "Messages",
      icon: "/icons/mail.svg",
      route: "/admin/contacts",
    },
    {
      id: "analytics",
      label: "Statistiques",
      icon: "/icons/target.svg",
      route: "/admin/analytics",
    },
    {
      id: "settings",
      label: "Paramètres",
      icon: "/icons/settings.svg",
      route: "/admin/settings",
    },
  ];

  // Actions
  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  toggleSidebarCollapse(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
    // Fermer les sous-menus quand on rétracte
    if (this.sidebarCollapsed()) {
      this.activeSection.set("");
      this.activeSubSection.set("");
    }
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  selectSection(item: SidebarItem): void {
    // En mode collapsed, naviguer directement
    if (this.sidebarCollapsed()) {
      this.router.navigate([item.route]);
      this.closeSidebar();
      return;
    }

    // En mode étendu, gérer les sous-menus
    if (item.children) {
      // Si l'item a des enfants, toggle l'ouverture/fermeture
      if (this.activeSection() === item.id) {
        // Si déjà ouvert, fermer
        this.activeSection.set("");
        this.activeSubSection.set("");
      } else {
        // Sinon, ouvrir
        this.activeSection.set(item.id);
        this.activeSubSection.set("");
      }
    } else {
      // Si pas d'enfants, naviguer directement
      this.activeSection.set("");
      this.activeSubSection.set("");
      this.router.navigate([item.route]);
      this.closeSidebar();
    }
  }

  selectSubSection(item: SidebarItem): void {
    this.activeSubSection.set(item.id);
    this.router.navigate([item.route]);
    this.closeSidebar();
  }

  getSectionClasses(sectionId: string): string {
    const isActive = this.activeSection() === sectionId;
    return isActive
      ? "bg-background hover:bg-accent text-text shadow-lg border border-accent mb-2"
      : "text-text hover:bg-accent hover:text-accent mb-2";
  }

  getSubSectionClasses(subSectionId: string): string {
    const isActive = this.activeSubSection() === subSectionId;
    return isActive
      ? "bg-background hover:bg-accent text-text border border-accent mb-2"
      : "text-text hover:bg-accent hover:text-accent";
  }

  private syncFromUrl(url: string): void {
    // Try to match child routes first
    const pairs = this.sidebarItems.flatMap(p => (p.children ?? []).map(c => ({ parent: p, child: c })));
    const childMatch = pairs.find(x => url.startsWith(x.child.route));
    if (childMatch) {
      this.activeSection.set(childMatch.parent.id);
      this.activeSubSection.set(childMatch.child.id);
      return;
    }
    // Then match top-level
    const topMatch = this.sidebarItems.find(i => url.startsWith(i.route));
    if (topMatch) {
      this.activeSection.set(topMatch.id);
      this.activeSubSection.set("");
      return;
    }
    // Default: dashboard for /admin root
    if (url === "/admin" || url.startsWith("/admin/")) {
      this.activeSection.set("dashboard");
      this.activeSubSection.set("");
    }
  }

  ngOnInit(): void {
    this.syncFromUrl(this.router.url);
    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.syncFromUrl(ev.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
