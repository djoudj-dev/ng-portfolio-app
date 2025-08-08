import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { from } from "rxjs";
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
    EditBadge,
    EditCvComponent,
    ProjectFormComponent,
    ProjectListComponent,
    ButtonComponent,
  ],
  template: `
    <div class="lg:mt-24 p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <app-edit-badge />
        <app-edit-cv />
      </div>

      <div class="mb-8 flex gap-4">
        <app-button (buttonClick)="showAddForm()" color="primary"
          >Ajouter un projet</app-button
        >
        <app-button (buttonClick)="showProjectList()" color="secondary"
          >Voir les projets</app-button
        >
      </div>

      @if (currentView() === "add") {
        <app-project-form />
      } @else if (currentView() === "list") {
        <app-project-list
          [projects]="projects()"
          (edit)="editProject($event)"
          (delete)="deleteProject($event)"
        />
      } @else if (currentView() === "edit") {
        <app-project-form [project]="selectedProject()" />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly projectService = inject(ProjectService);

  readonly currentView = signal<"add" | "list" | "edit">("list");
  readonly selectedProject = signal<ProjectData | undefined>(undefined);
  private readonly refreshTrigger = signal<void>(undefined);

  readonly projects = toSignal(from(this.projectService.getProjects()), {
    initialValue: [],
  });

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
