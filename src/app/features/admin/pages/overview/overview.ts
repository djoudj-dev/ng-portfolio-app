import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";
import { BadgeService } from "@features/badge/services/badge-service";
import { ProjectService } from "@features/projects/services/project-service";
import { ProjectModel } from "@features/projects/models/project-model";
import { BADGE_STATUS } from "@features/badge/models/badge-model";
import { toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: "app-admin-overview",
  imports: [ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-accent pb-4">
        <h1 class="text-2xl font-bold text-text">Vue d'ensemble</h1>
        <p class="text-secondary mt-1">
          Gérez votre portfolio depuis ce dashboard
        </p>
      </div>
      <!-- Stats -->
      <!-- Quick actions -->
      <div class="bg-background rounded-xl p-6 border border-accent p-6">
        <h2 class="text-lg font-semibold text-text mb-4">Actions rapides</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-button
            (buttonClick)="navigateTo('/admin/badges/create')"
            color="primary"
            [customClass]="'w-full justify-center'"
          >
            <div class="flex items-center">
              <img
                [ngSrc]="'icons/edit.svg'"
                alt="Modifier"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Nouveau badge
            </div>
          </app-button>

          <app-button
            (buttonClick)="navigateTo('/admin/projects/create')"
            color="secondary"
            [customClass]="'w-full justify-center'"
          >
            <div class="flex items-center">
              <img
                [ngSrc]="'/icons/plus.svg'"
                alt="Ajouter"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Nouveau projet
            </div>
          </app-button>

          <app-button
            (buttonClick)="navigateTo('/admin/cv/edit')"
            color="accent"
            [customClass]="'w-full justify-center'"
          >
            <div class="flex items-center">
              <img
                [ngSrc]="'/icons/edit.svg'"
                alt="Modifier"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Modifier CV
            </div>
          </app-button>

          <app-button
            (buttonClick)="navigateTo('/admin/contacts')"
            color="primary"
            [customClass]="'w-full justify-center'"
          >
            <div class="flex items-center">
              <img
                [ngSrc]="'/icons/mail.svg'"
                alt="Messages"
                class="w-4 h-4 mr-2 icon-invert"
                width="16"
                height="16"
              />
              Voir messages
            </div>
          </app-button>
        </div>
      </div>


      <!-- Recent activity -->
      <div class="bg-background rounded-xl border border-accent p-6">
        <h2 class="text-lg font-semibold text-text mb-4">Activité récente</h2>
        <div class="space-y-3">
          @if (latestBadge()) {
            <div
              class="flex items-center p-3 bg-background border border-accent rounded-lg"
            >
              <img
                [ngSrc]="'/icons/badge.svg'"
                alt="Badge"
                class="w-5 h-5 icon-invert"
                width="20"
                height="20"
              />
              <span class="ml-3 text-sm text-text"
                >Dernier badge mis à jour</span
              >
              <span class="ml-auto text-xs text-text">{{
                getRelativeTime(latestBadge()!.updatedAt.toISOString())
              }}</span>
            </div>
          }

          @if (latestProject()) {
            <div
              class="flex items-center p-3 bg-background border border-accent rounded-lg"
            >
              <img
                [ngSrc]="'/icons/folder.svg'"
                alt="Projet"
                class="w-5 h-5 icon-invert"
                width="20"
                height="20"
              />
              <span class="ml-3 text-sm text-text"
                >Projet "{{ latestProject()!.title }}" créé</span
              >
              <span class="ml-auto text-xs text-text">{{
                getRelativeTime(latestProject()!.date)
              }}</span>
            </div>
          }

          <div
            class="flex items-center p-3 bg-background border border-accent rounded-lg"
          >
            <img
              [ngSrc]="'/icons/dashboard.svg'"
              alt="Dashboard"
              class="w-5 h-5 icon-invert"
              width="20"
              height="20"
            />
            <span class="ml-3 text-sm text-text"
              >Dashboard admin accessible</span
            >
            <span class="ml-auto text-xs text-text">Maintenant</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminOverviewComponent {
  private readonly router = inject(Router);
  private readonly badgeService = inject(BadgeService);
  private readonly projectService = inject(ProjectService);

  // Données des badges
  readonly badges = this.badgeService.badges;
  readonly latestBadge = this.badgeService.latestBadge;

  // Données des projets
  readonly projects = toSignal(from(this.projectService.getAllProjects()), {
    initialValue: {
      projects: [] as ProjectModel[],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
  });


  // Statistiques calculées
  readonly badgeStats = computed(() => {
    const badges = this.badges();
    return {
      total: badges.length,
      available: badges.filter((b) => b.status === BADGE_STATUS.AVAILABLE).length,
      upcoming: badges.filter((b) => b.status === BADGE_STATUS.AVAILABLE_FROM).length,
      unavailable: badges.filter((b) => b.status === BADGE_STATUS.UNAVAILABLE).length,
    };
  });

  readonly featuredProjectsCount = computed(() => {
    const projectsData = this.projects();
    if (!projectsData?.projects) return 0;
    return projectsData.projects.filter((p: ProjectModel) => p.featured).length;
  });

  readonly latestProject = computed(() => {
    const projectsData = this.projects();
    if (!projectsData?.projects?.length) return null;
    return (
      projectsData.projects
        .filter((p: ProjectModel) => p.date) // Filtrer les projets qui ont une date
        .sort(
          (a: ProjectModel, b: ProjectModel) => new Date(b.date!).getTime() - new Date(a.date!).getTime(),
        )[0] ?? null
    );
  });

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getRelativeTime(dateString: string | null): string {
    if (!dateString) return "Date inconnue";

    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    } else if (diffInHours > 0) {
      return `Il y a ${diffInHours}h`;
    } else {
      return "Il y a quelques minutes";
    }
  }
}
