import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonComponent } from "@shared/ui/button/button";
import { CustomMultiSelectComponent } from "@features/projects/components/custom-multi-select/custom-multi-select";
import { TECHNOLOGIES } from "@features/projects/data/technologies";
import { ProjectService } from "@features/projects/services/project-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import {
  ProjectData,
  ProjectCategory,
} from "@features/projects/interface/project-data";
import {
  ProjectInsertData,
  ProjectUpdateData,
  ProjectFormValue,
} from "@features/projects/services/project-service";

@Component({
  selector: "app-project-form",
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CustomMultiSelectComponent,
    NgOptimizedImage,
  ],
  templateUrl: "./project-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent {
  project = input<ProjectData | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly toastService = inject(ToastService);

  selectedFile: File | null = null;
  imagePreview = signal<string | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);

  technologies = TECHNOLOGIES;

  projectForm = this.fb.group({
    title: ["", Validators.required],
    description: ["", Validators.required],
    technologies: [[] as string[], Validators.required],
    demo_url: [null as string | null],
    category: [null as ProjectCategory | null, Validators.required],
    featured: [false],
    date: [null as string | null, Validators.required],
    github_urls: this.fb.group({
      frontend: [null as string | null],
      backend: [null as string | null],
      fullstack: [null as string | null],
    }),
  });
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.imagePreview.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      this.toastService.show({
        message: "Le formulaire est invalide.",
        type: "error",
      });
      return;
    }

    this.isLoading.set(true);

    try {
      const rawData = this.projectForm.getRawValue() as ProjectFormValue;
      const formData: ProjectInsertData = {
        title: rawData.title ?? "",
        description: rawData.description ?? "",
        technologies: rawData.technologies ?? [],
        demo_url: rawData.demo_url ?? undefined,
        category: rawData.category ?? null,
        featured: rawData.featured ?? false,
        date: rawData.date ?? null,
        github_urls: rawData.github_urls ?? undefined,
      };

      if (this.isEditMode() && this.project()) {
        const projectValue = this.project()!;
        const updateData: ProjectUpdateData = {
          ...formData,
          image_path: projectValue.image_path,
        };
        await this.projectService.updateProject(
          projectValue.id,
          updateData,
          this.selectedFile ?? undefined,
        );
        this.toastService.show({
          message: "Projet mis à jour avec succès !",
          type: "success",
        });
      } else if (this.selectedFile) {
        await this.projectService.addProject(formData, this.selectedFile);
        this.toastService.show({
          message: "Projet ajouté avec succès !",
          type: "success",
        });
      }
      this.projectForm.reset();
      this.imagePreview.set(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.";
      this.toastService.show({ message: `Erreur: ${message}`, type: "error" });
    } finally {
      this.isLoading.set(false);
    }
  }
}
