import { Component, signal, inject, ChangeDetectionStrategy, computed } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { NgOptimizedImage } from "@angular/common";
import { ProjectService } from "@features/projects/services/project-service";
import { ProjectModel } from "@features/projects/models/project-model";
import { ButtonComponent } from "@shared/ui/button/button";
import { Router } from "@angular/router";

@Component({
  selector: "app-project-manager",
  imports: [ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-accent pb-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-text">Gestion des projets</h1>
          </div>
          <app-button
            (buttonClick)="navigateToCreate()"
            color="accent"
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
        </div>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center space-x-4">
        <span class="text-sm font-medium text-text">Vue:</span>
        <div class="flex bg-background  rounded-lg p-1">
          <button
            (click)="setView('list')"
            [class]="getViewButtonClass('list')"
            class="px-3 py-1 text-sm rounded-md transition-all"
          >
            <img
              [ngSrc]="'/icons/list.svg'"
              alt="Liste"
              class="w-4 h-4 inline mr-1 icon-invert"
              width="16"
              height="16"
            />
            Liste
          </button>
          <button
            (click)="setView('grid')"
            [class]="getViewButtonClass('grid')"
            class="px-3 py-1 text-sm rounded-md transition-all"
          >
            <img
              [ngSrc]="'/icons/grid.svg'"
              alt="Grille"
              class="w-4 h-4 inline mr-1 icon-invert"
              width="16"
              height="16"
            />
            Grille
          </button>
        </div>
      </div>

      <!-- Projects List/Grid -->
      <div class="bg-background rounded-xl border border-accent p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-text">
            Projets ({{ projects().length }})
          </h2>

          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="relative">
              <input
                type="text"
                placeholder="Rechercher un projet..."
                class="pl-8 pr-4 py-2 border border-accent  rounded-lg bg-background text-text placeholder-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <img
                [ngSrc]="'icons/search.svg'"
                alt="Rechercher"
                class="absolute left-2 top-2.5 w-5 h-5 icon-invert"
                width="16"
                height="16"
              />
            </div>

            <!-- Filter -->
            <select class="px-3 py-2 border border-accent rounded-lg bg-background text-text focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Toutes catégories</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="api">API</option>
            </select>
          </div>
        </div>

        @if (currentView() === 'list') {
          <!-- List View -->
          <div class="space-y-4">
            @for (project of projects(); track project.id) {
              <div class="flex items-center justify-between p-4 border border-accent rounded-lg hover:shadow-md transition-shadow">
                <div class="flex items-center space-x-4">
                  @if (project.imagePath) {
                    <img
                      [ngSrc]="projectService.getImageUrl(project.imagePath)"
                      [alt]="project.title"
                      class="w-12 h-12 rounded-lg object-cover"
                      width="48"
                      height="48"
                    />
                  } @else {
                    <div class="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <img
                        [ngSrc]="'/icons/folder.svg'"
                        alt="Projet"
                        class="w-12 h-12 icon-invert"
                        width="24"
                        height="24"
                      />
                    </div>
                  }

                  <div>
                    <h3 class="text-sm font-medium text-text">{{ project.title }}</h3>
                    <p class="text-xs text-secondary line-clamp-1">{{ project.description }}</p>
                    <div class="flex items-center mt-1 space-x-2">
                      <span class="text-xs bg-accent text-text px-2 py-1 rounded-full">
                        {{ project.category }}
                      </span>
                      @if (project.featured) {
                        <span class="text-xs bg-accent-100 text-accent-800 px-2 py-1 rounded-full">
                          ⭐ Mis en avant
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  @if (project.demoUrl) {
                    <button class="p-2 hover:bg-accent-100 rounded-lg" title="Voir la démo">
                      <img [ngSrc]="'/icons/external-link.svg'" alt="Démo" class="w-4 h-4 icon-invert" width="16" height="16" />
                    </button>
                  }
                  <button
                    (click)="editProject(project.id)"
                    class="p-2 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-lg"
                    title="Modifier"
                  >
                    <img [ngSrc]="'/icons/edit.svg'" alt="Modifier" class="w-4 h-4 icon-invert" width="16" height="16" />
                  </button>
                  <button
                    (click)="deleteProject(project)"
                    class="p-2 hover:bg-red-100 dark:hover:bg-red-800 rounded-lg"
                    title="Supprimer"
                  >
                    <img [ngSrc]="'/icons/trash.svg'" alt="Supprimer" class="w-4 h-4 icon-invert" width="16" height="16" />
                  </button>
                </div>
              </div>
            } @empty {
              <div class="text-center py-12">
                <img
                  [ngSrc]="'/icons/folder.svg'"
                  alt="Aucun projet"
                  class="w-12 h-12 mx-auto mb-4 opacity-50 icon-invert"
                  width="48"
                  height="48"
                />
                <p class="text-secondary">Aucun projet trouvé</p>
              </div>
            }
          </div>
        } @else {
          <!-- Grid View -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projects(); track project.id) {
              <div class="border border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                @if (project.imagePath) {
                  <img
                    [ngSrc]="projectService.getImageUrl(project.imagePath)"
                    [alt]="project.title"
                    class="w-full h-40 object-cover"
                    width="320"
                    height="158"
                    priority
                  />
                } @else {
                  <div class="w-full h-40 bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <img
                      [ngSrc]="'/icons/folder.svg'"
                      alt="Projet"
                      class="w-12 h-12 icon-invert opacity-50"
                      width="48"
                      height="48"
                    />
                  </div>
                }

                <div class="p-4">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="text-sm font-medium text-text line-clamp-1">{{ project.title }}</h3>
                    @if (project.featured) {
                      <span class="text-xs text-accent">⭐</span>
                    }
                  </div>

                  <p class="text-xs text-secondary line-clamp-2 mb-3">{{ project.description }}</p>

                  <div class="flex items-center justify-between">
                    <span class="text-xs bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-200 px-2 py-1 rounded-full">
                      {{ project.category }}
                    </span>

                    <div class="flex space-x-1">
                      @if (project.demoUrl) {
                        <button class="p-1 hover:bg-accent-100 dark:hover:bg-accent-800 rounded" title="Voir la démo">
                          <img [ngSrc]="'/icons/external-link.svg'" alt="Démo" class="w-4 h-4 icon-invert" width="16" height="16" />
                        </button>
                      }
                      <button
                        (click)="editProject(project.id)"
                        class="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded"
                        title="Modifier"
                      >
                        <img [ngSrc]="'/icons/edit.svg'" alt="Modifier" class="w-4 h-4 icon-invert" width="16" height="16" />
                      </button>
                      <button
                        (click)="deleteProject(project)"
                        class="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                        title="Supprimer"
                      >
                        <img [ngSrc]="'/icons/trash.svg'" alt="Supprimer" class="w-4 h-4 icon-invert" width="16" height="16" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12">
                <img
                  [ngSrc]="'/icons/folder.svg'"
                  alt="Aucun projet"
                  class="w-12 h-12 mx-auto mb-4 opacity-50 icon-invert"
                  width="48"
                  height="48"
                />
                <p class="text-secondary">Aucun projet trouvé</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ProjectManagerComponent {
  readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  readonly currentView = signal<'list' | 'grid'>('grid');
  private readonly projectsResponse = toSignal(from(this.projectService.getAllProjects()), {
    initialValue: { projects: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  });
  readonly projects = computed(() => this.projectsResponse()?.projects || []);

  setView(view: 'list' | 'grid'): void {
    this.currentView.set(view);
  }

  getViewButtonClass(view: 'list' | 'grid'): string {
    return this.currentView() === view
      ? 'bg-accent text-text shadow-sm'
      : 'text-secondary hover:text-primary';
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/projects/create']);
  }

  editProject(id: string): void {
    this.router.navigate(['/admin/projects/edit', id]);
  }

  async deleteProject(project: ProjectModel): Promise<void> {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ?`)) {
      try {
        await this.projectService.deleteProject(project.id);
        // Refresh projects list
        window.location.reload();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  }
}
