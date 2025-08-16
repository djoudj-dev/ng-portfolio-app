import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
import { NgOptimizedImage } from "@angular/common";
import { AdminLayoutComponent } from "../components/admin-layout/admin-layout";
import { EditCvComponent } from "./edit-cv/edit-cv";
import { EditBadge } from "@features/landing/badge/components/edit-badge/edit-badge";
import { ProjectFormComponent } from "@features/projects/components/project-form/project-form";
import { ProjectListComponent } from "@features/projects/components/project-list/project-list";
import { ProjectService } from "@features/projects/services/project-service";
import { ProjectData } from "@features/projects/interface/project-data";
import { ButtonComponent } from "@shared/ui/button/button";

@Component({
  selector: "app-dashboard",
  imports: [
    NgOptimizedImage,
    AdminLayoutComponent,
    EditBadge,
    EditCvComponent,
    ProjectFormComponent,
    ProjectListComponent,
    ButtonComponent,
  ],
  template: `
    <app-admin-layout>
      <div class="min-h-screen bg-background">
        <!-- Main content area -->
        <div class="max-w-7xl mx-auto">
          <!-- Header -->
          <header class="mb-8">
            <div
              class="bg-background-200 shadow-text border-accent rounded-lg border p-6"
            >
              <h1
                class="text-text decoration-accent flex items-center text-2xl lg:text-3xl font-bold underline mb-2"
              >
                <img
                  [ngSrc]="'/icons/admin.svg'"
                  alt="Icône admin"
                  class="mr-3 w-8 h-8 icon-invert"
                  width="32"
                  height="32"
                />
                Dashboard Administrateur
              </h1>
              <p class="text-text/80 text-lg">
                Gestion du contenu du portfolio
              </p>
            </div>
          </header>

          <!-- Quick Actions Cards -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            <article
              class="bg-background shadow-text border-accent rounded-lg border p-6 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center mb-4">
                <div class="bg-accent text-background rounded-full p-3 mr-4">
                  <img
                    [ngSrc]="'/icons/edit.svg'"
                    alt="Icône édition"
                    class="w-6 h-6 icon-invert"
                    width="24"
                    height="24"
                  />
                </div>
                <h2 class="text-text text-xl font-bold">Gestion CV</h2>
              </div>
              <p class="text-text/80 mb-4">Mettre à jour et gérer votre CV</p>
              <app-button
                (buttonClick)="showCvManager()"
                color="accent"
                customClass="w-full"
              >
                Gérer le CV
              </app-button>
            </article>

            <article
              class="bg-background shadow-text border-accent rounded-lg border p-6 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center mb-4">
                <div class="bg-accent text-background rounded-full p-3 mr-4">
                  <img
                    [ngSrc]="'/icons/folder.svg'"
                    alt="Icône projets"
                    class="w-6 h-6 icon-invert"
                    width="24"
                    height="24"
                  />
                </div>
                <h2 class="text-text text-xl font-bold">Projets</h2>
              </div>
              <p class="text-text/80 mb-4">Ajouter et modifier vos projets</p>
              <app-button
                (buttonClick)="showAddForm()"
                color="accent"
                customClass="w-full"
              >
                Nouveau Projet
              </app-button>
            </article>

            <article
              class="bg-background shadow-text border-accent rounded-lg border p-6 hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              <div class="flex items-center mb-4">
                <div class="bg-accent text-background rounded-full p-3 mr-4">
                  <img
                    [ngSrc]="'/icons/trophy.svg'"
                    alt="Icône badges"
                    class="w-6 h-6 icon-invert"
                    width="24"
                    height="24"
                  />
                </div>
                <h2 class="text-text text-xl font-bold">Badges</h2>
              </div>
              <p class="text-text/80 mb-4">
                Gérer vos badges et certifications
              </p>
              <app-button
                (buttonClick)="showBadgeManager()"
                color="accent"
                customClass="w-full"
              >
                Gérer les Badges
              </app-button>
            </article>
          </div>

          <!-- Dynamic Content Area -->
          <section
            class="bg-background shadow-text border-accent rounded-lg border p-6"
          >
            @if (currentView() === "cv") {
              <app-edit-cv />
            } @else if (currentView() === "badges") {
              <app-edit-badge />
            } @else if (currentView() === "add") {
              <div class="mb-6">
                <h2 class="text-text text-2xl font-bold mb-4">
                  Nouveau Projet
                </h2>
                <app-button
                  (buttonClick)="showProjectList()"
                  color="secondary"
                  customClass="mb-4"
                >
                  ← Retour à la liste
                </app-button>
              </div>
              <app-project-form />
            } @else if (currentView() === "list") {
              <div
                class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <h2 class="text-text text-2xl font-bold">
                  Gestion des Projets
                </h2>
                <app-button
                  (buttonClick)="showAddForm()"
                  color="accent"
                  customClass="sm:w-auto"
                >
                  <div class="flex items-center gap-2">
                    <img
                      [ngSrc]="'/icons/plus.svg'"
                      alt="Icône ajout"
                      class="w-4 h-4 icon-invert"
                      width="16"
                      height="16"
                    />
                    Nouveau Projet
                  </div>
                </app-button>
              </div>
              <app-project-list
                [projects]="projects()"
                (edit)="editProject($event)"
                (delete)="deleteProject($event)"
              />
            } @else if (currentView() === "edit") {
              <div class="mb-6">
                <h2 class="text-text text-2xl font-bold mb-4">
                  Modifier le Projet
                </h2>
                <app-button
                  (buttonClick)="showProjectList()"
                  color="secondary"
                  customClass="mb-4"
                >
                  ← Retour à la liste
                </app-button>
              </div>
              <app-project-form [project]="selectedProject()" />
            } @else {
              <!-- Default overview -->
              <div class="text-center py-12">
                <img
                  [ngSrc]="'/icons/admin.svg'"
                  alt="Icône dashboard"
                  class="w-16 h-16 mx-auto mb-4 icon-invert opacity-50"
                  width="64"
                  height="64"
                />
                <h2 class="text-text text-xl font-bold mb-2">
                  Bienvenue sur votre Dashboard
                </h2>
                <p class="text-text/60">
                  Sélectionnez une action ci-dessus pour commencer
                </p>
              </div>
            }
          </section>
        </div>
      </div>
    </app-admin-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly projectService = inject(ProjectService);

  readonly currentView = signal<
    "overview" | "cv" | "badges" | "add" | "list" | "edit"
  >("overview");
  readonly selectedProject = signal<ProjectData | undefined>(undefined);
  private readonly refreshTrigger = signal<void>(undefined);

  readonly projects = toSignal(from(this.projectService.getProjects()), {
    initialValue: [],
  });

  showCvManager(): void {
    this.currentView.set("cv");
  }

  showBadgeManager(): void {
    this.currentView.set("badges");
  }

  showAddForm(): void {
    this.currentView.set("add");
    this.selectedProject.set(undefined);
  }

  showProjectList(): void {
    this.currentView.set("list");
    this.selectedProject.set(undefined);
    this.refreshTrigger.set(); // Trigger a refresh
  }

  editProject(id: string): void {
    const projectToEdit = this.projects()?.find((p) => p.id === id);
    if (projectToEdit) {
      this.selectedProject.set(projectToEdit);
      this.currentView.set("edit");
    }
  }

  async deleteProject(project: ProjectData): Promise<void> {
    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ?`,
      )
    ) {
      try {
        await this.projectService.deleteProject(project.id, project.image_path);
        this.refreshTrigger.set(); // Trigger a refresh
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  }
}
