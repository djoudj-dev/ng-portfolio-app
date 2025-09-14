import { Component, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
import { ProjectService } from '@features/projects/services/project-service';
import { ProjectModel } from '@features/projects/models/project-model';
import { ButtonComponent } from '@shared/ui/button/button';
import { Router } from '@angular/router';
import { sortProjectsByPriority } from '@features/projects/utils/project-sort';

@Component({
  selector: 'app-project-manager',
  imports: [ButtonComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-6xl mx-auto p-6 space-y-8">
      <header
        class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-accent/20 shadow-sm"
      >
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <img
                  [ngSrc]="'/icons/project.svg'"
                  alt="Projets"
                  width="24"
                  height="24"
                  class="w-6 h-6 icon-invert"
                />
              </div>
              <h1 class="text-3xl font-bold text-text">Gestion des projets</h1>
            </div>
            <p class="text-secondary text-base max-w-2xl">
              Gérez et organisez votre portfolio de projets avec des outils de création,
              modification et suppression.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div
              class="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-accent/30 shadow-sm"
            >
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
                <span class="text-sm font-medium text-text"> {{ projects().length }} projets </span>
              </div>
            </div>

            <app-button
              (buttonClick)="navigateToCreate()"
              color="accent"
              [customClass]="'px-6 py-3'"
            >
              <div class="flex items-center gap-2">
                <img
                  [ngSrc]="'/icons/plus.svg'"
                  alt="Ajouter"
                  class="w-5 h-5 icon-invert"
                  width="20"
                  height="20"
                />
                Nouveau projet
              </div>
            </app-button>
          </div>
        </div>
      </header>

      <section class="bg-background rounded-2xl border border-accent/20 shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-text">Affichage:</span>
            <div class="flex bg-accent/5 rounded-xl p-1 border border-accent/20">
              <button
                (click)="setView('list')"
                [class]="getViewButtonClass('list')"
                class="px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <img
                  [ngSrc]="'/icons/list.svg'"
                  alt="Liste"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
                Liste
              </button>
              <button
                (click)="setView('grid')"
                [class]="getViewButtonClass('grid')"
                class="px-4 py-2 text-sm rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <img
                  [ngSrc]="'/icons/grid.svg'"
                  alt="Grille"
                  class="w-4 h-4 icon-invert"
                  width="16"
                  height="16"
                />
                Grille
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div class="relative">
              <input
                type="text"
                placeholder="Rechercher un projet..."
                class="pl-10 pr-4 py-2.5 border border-accent/30 rounded-xl bg-background text-text placeholder-secondary focus:ring-2 focus:ring-primary focus:border-primary/30 transition-all duration-200 min-w-[250px]"
              />
              <img
                [ngSrc]="'/icons/search.svg'"
                alt="Rechercher"
                class="absolute left-3 top-3 w-5 h-5 icon-invert opacity-60"
                width="20"
                height="20"
              />
            </div>

            <select
              class="px-4 py-2.5 border border-accent/30 rounded-xl bg-background text-text focus:ring-2 focus:ring-primary focus:border-primary/30 transition-all duration-200"
            >
              <option value="">Toutes catégories</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="api">API</option>
            </select>
          </div>
        </div>
      </section>

      <main class="space-y-6">
        @if (currentView() === 'list') {
          <div class="space-y-4">
            @for (project of projects(); track project.id) {
              <article
                class="bg-background rounded-2xl border border-accent/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <div class="p-6">
                  <div class="flex items-center gap-6">
                    <!-- Project Image -->
                    <div class="flex-shrink-0">
                      @if (project.imagePath) {
                        <img
                          [ngSrc]="projectService.getImageUrl(project.imagePath)"
                          [alt]="project.title"
                          class="w-16 h-16 rounded-xl object-cover shadow-sm"
                          width="64"
                          height="64"
                        />
                      } @else {
                        <div
                          class="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20"
                        >
                          <img
                            [ngSrc]="'/icons/folder.svg'"
                            alt="Projet"
                            class="w-8 h-8 icon-invert opacity-60"
                            width="32"
                            height="32"
                          />
                        </div>
                      }
                    </div>

                    <div class="flex-1 min-w-0 space-y-2">
                      <div class="flex items-start justify-between gap-4">
                        <div class="space-y-1">
                          <div class="flex items-center gap-3">
                            <h3 class="text-lg font-semibold text-text truncate">
                              {{ project.title }}
                            </h3>
                            @if (project.featured) {
                              <span
                                class="bg-accent/10 text-accent text-xs font-medium px-2.5 py-1 rounded-full border border-accent/20 flex items-center gap-1"
                              >
                                <span>⭐</span>
                                Mis en avant
                              </span>
                            }
                          </div>
                          <div class="flex items-center gap-2">
                            <span
                              class="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20"
                            >
                              {{ project.category }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p class="text-secondary leading-relaxed line-clamp-2">
                        {{ project.description }}
                      </p>
                    </div>

                    <div class="flex-shrink-0">
                      <div class="flex items-center gap-2">
                        @if (project.demoUrl) {
                          <button
                            class="p-3 hover:bg-accent/10 rounded-xl transition-colors duration-200 group border border-transparent hover:border-accent/20"
                            title="Voir la démo"
                          >
                            <img
                              [ngSrc]="'/icons/external-link.svg'"
                              alt="Démo"
                              class="w-5 h-5 icon-invert group-hover:scale-110 transition-transform duration-200"
                              width="20"
                              height="20"
                            />
                          </button>
                        }
                        <button
                          (click)="editProject(project.id)"
                          class="p-3 hover:bg-primary/10 rounded-xl transition-colors duration-200 group border border-transparent hover:border-primary/20"
                          title="Modifier"
                        >
                          <img
                            [ngSrc]="'/icons/edit.svg'"
                            alt="Modifier"
                            class="w-5 h-5 icon-invert group-hover:scale-110 transition-transform duration-200"
                            width="20"
                            height="20"
                          />
                        </button>
                        <button
                          (click)="deleteProject(project)"
                          class="p-3 hover:bg-red/10 rounded-xl transition-colors duration-200 group border border-transparent hover:border-red/20"
                          title="Supprimer"
                        >
                          <img
                            [ngSrc]="'/icons/trash.svg'"
                            alt="Supprimer"
                            class="w-5 h-5 icon-invert group-hover:scale-110 transition-transform duration-200"
                            width="20"
                            height="20"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="text-center py-24">
                <div
                  class="bg-background rounded-2xl border border-accent/20 p-12 max-w-md mx-auto"
                >
                  <div
                    class="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <img
                      [ngSrc]="'/icons/folder.svg'"
                      alt="Aucun projet"
                      width="40"
                      height="40"
                      class="w-10 h-10 icon-invert opacity-60"
                    />
                  </div>
                  <h3 class="text-xl font-semibold text-text mb-2">Aucun projet</h3>
                  <p class="text-secondary">
                    Commencez par créer votre premier projet en cliquant sur le bouton "Nouveau
                    projet".
                  </p>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projects(); track project.id) {
              <article
                class="bg-background rounded-2xl border border-accent/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                @if (project.imagePath) {
                  <div class="relative overflow-hidden">
                    <img
                      [ngSrc]="projectService.getImageUrl(project.imagePath)"
                      [alt]="project.title"
                      class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      width="320"
                      height="192"
                      priority
                    />
                    @if (project.featured) {
                      <div class="absolute top-3 right-3">
                        <span
                          class="bg-accent/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-accent/30 flex items-center gap-1"
                        >
                          <span>⭐</span>
                          Featured
                        </span>
                      </div>
                    }
                  </div>
                } @else {
                  <div
                    class="w-full h-48 bg-accent/5 flex items-center justify-center border-b border-accent/20 relative"
                  >
                    <img
                      [ngSrc]="'/icons/folder.svg'"
                      alt="Projet"
                      class="w-16 h-16 icon-invert opacity-40"
                      width="64"
                      height="64"
                    />
                    @if (project.featured) {
                      <div class="absolute top-3 right-3">
                        <span
                          class="bg-accent/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-accent/30 flex items-center gap-1"
                        >
                          <span>⭐</span>
                          Featured
                        </span>
                      </div>
                    }
                  </div>
                }

                <div class="p-6 space-y-4">
                  <div class="space-y-2">
                    <h3
                      class="text-lg font-semibold text-text line-clamp-1 group-hover:text-primary transition-colors duration-200"
                    >
                      {{ project.title }}
                    </h3>
                    <p class="text-secondary line-clamp-2 text-sm leading-relaxed">
                      {{ project.description }}
                    </p>
                  </div>

                  <div class="flex items-center justify-between pt-2">
                    <span
                      class="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/20"
                    >
                      {{ project.category }}
                    </span>

                    <div class="flex items-center gap-1">
                      @if (project.demoUrl) {
                        <button
                          class="p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200 group/btn"
                          title="Voir la démo"
                        >
                          <img
                            [ngSrc]="'/icons/external-link.svg'"
                            alt="Démo"
                            class="w-4 h-4 icon-invert group-hover/btn:scale-110 transition-transform duration-200"
                            width="16"
                            height="16"
                          />
                        </button>
                      }
                      <button
                        (click)="editProject(project.id)"
                        class="p-2 hover:bg-primary/10 rounded-lg transition-colors duration-200 group/btn"
                        title="Modifier"
                      >
                        <img
                          [ngSrc]="'/icons/edit.svg'"
                          alt="Modifier"
                          class="w-4 h-4 icon-invert group-hover/btn:scale-110 transition-transform duration-200"
                          width="16"
                          height="16"
                        />
                      </button>
                      <button
                        (click)="deleteProject(project)"
                        class="p-2 hover:bg-red/10 rounded-lg transition-colors duration-200 group/btn"
                        title="Supprimer"
                      >
                        <img
                          [ngSrc]="'/icons/trash.svg'"
                          alt="Supprimer"
                          class="w-4 h-4 icon-invert group-hover/btn:scale-110 transition-transform duration-200"
                          width="16"
                          height="16"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="col-span-full text-center py-24">
                <div
                  class="bg-background rounded-2xl border border-accent/20 p-12 max-w-md mx-auto"
                >
                  <div
                    class="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <img
                      [ngSrc]="'/icons/folder.svg'"
                      alt="Aucun projet"
                      width="40"
                      height="40"
                      class="w-10 h-10 icon-invert opacity-60"
                    />
                  </div>
                  <h3 class="text-xl font-semibold text-text mb-2">Aucun projet</h3>
                  <p class="text-secondary">
                    Commencez par créer votre premier projet en cliquant sur le bouton "Nouveau
                    projet".
                  </p>
                </div>
              </div>
            }
          </div>
        }
      </main>
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
  readonly projects = computed(() => {
    const list = this.projectsResponse()?.projects || [];
    return sortProjectsByPriority(list);
  });

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
        window.location.reload();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }
}
