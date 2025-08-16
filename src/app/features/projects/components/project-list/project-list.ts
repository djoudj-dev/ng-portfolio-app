import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from "@angular/core";
import { ProjectData } from "@features/projects/interface/project-data";
import { ProjectService } from "@features/projects/services/project-service";
import { NgOptimizedImage } from "@angular/common";
import { ButtonComponent } from "@shared/ui/button/button";

@Component({
  selector: "app-project-list",
  imports: [NgOptimizedImage, ButtonComponent],
  template: `
    <div
      class="bg-background p-4 sm:p-6 rounded-lg shadow-md shadow-accent border border-primary-300"
    >
      <h2 class="text-xl sm:text-2xl font-bold text-text mb-6">
        Liste des projets
      </h2>
      <div class="space-y-4">
        @for (project of projects(); track project.id) {
          <div
            class="flex items-center justify-between p-3 bg-background-200 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <img
                [ngSrc]="getProjectImageUrl(project.image_path)"
                [alt]="project.title"
                width="60"
                height="40"
                class="rounded-md object-cover"
              />
              <span class="font-medium text-text">{{ project.title }}</span>
            </div>
            <div class="flex gap-2">
              <app-button
                (buttonClick)="edit.emit(project.id)"
                color="secondary"
                customClass="px-3 py-1 text-sm"
                >Modifier</app-button
              >
              <app-button
                (buttonClick)="delete.emit(project)"
                color="accent"
                customClass="px-3 py-1 text-sm"
                >Supprimer</app-button
              >
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  projects = input.required<ProjectData[]>();
  edit = output<string>();
  delete = output<ProjectData>();

  private readonly projectService = inject(ProjectService);

  getProjectImageUrl(imagePath: string): string {
    return this.projectService.getPublicUrl(imagePath);
  }
}
