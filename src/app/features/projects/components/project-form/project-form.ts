import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  OnInit,
  effect,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ButtonComponent } from "@shared/ui/button/button";
import { CustomMultiSelectComponent } from "@features/projects/components/custom-multi-select/custom-multi-select";
import { TECHNOLOGIES } from "@features/projects/data/technologies";
import { ProjectService } from "@features/projects/services/project-service";
import { ToastService } from "@shared/ui/toast/service/toast-service";
import {
  ProjectModel,
  CreateProjectDto,
  UpdateProjectDto
} from "@features/projects/models/project-model";
import {
  ProjectCategory,
  ProjectStatus,
} from "@features/projects/enums/project-enum";

@Component({
  selector: "app-project-form",
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CustomMultiSelectComponent,
  ],
  templateUrl: "./project-form.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent implements OnInit {
  project = input<ProjectModel | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  private readonly currentProject = signal<ProjectModel | null>(null);

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

  constructor() {
    // Effect pour initialiser le formulaire quand le projet est chargé
    effect(() => {
      const project = this.currentProject();
      if (project) {
        this.initializeFormWithProject(project);
        this.isEditMode.set(true);
        if (project.imagePath) {
          this.imagePreview.set(this.projectService.getImageUrl(project.imagePath));
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Récupérer l'ID du projet depuis les paramètres de route
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      // Mode édition - charger le projet
      try {
        this.isLoading.set(true);
        const project = await this.projectService.getProjectById(projectId);
        this.currentProject.set(project);
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        this.toastService.danger('Erreur', 'Erreur lors du chargement du projet');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mode création - formulaire vide
      this.isEditMode.set(false);
    }
  }

  private initializeFormWithProject(project: ProjectModel): void {
    // Convertir la date ISO en format yyyy-MM-dd pour l'input HTML date
    const formattedDate = project.date ? new Date(project.date).toISOString().split('T')[0] : null;

    this.projectForm.patchValue({
      title: project.title,
      description: project.description,
      technologies: project.technologies,
      demo_url: project.demoUrl,
      category: project.category,
      featured: project.featured,
      date: formattedDate,
      github_urls: {
        frontend: project.githubUrls?.frontend,
        backend: project.githubUrls?.backend,
        fullstack: project.githubUrls?.fullstack,
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      // En mode édition, restaurer l'image existante si aucun nouveau fichier n'est sélectionné
      if (this.isEditMode() && this.currentProject()?.imagePath) {
        this.imagePreview.set(this.projectService.getImageUrl(this.currentProject()!.imagePath));
      } else {
        this.imagePreview.set(null);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      console.error('Form validation errors:', this.projectForm.errors);
      this.markFormGroupTouched();
      this.toastService.danger('Formulaire invalide', 'Le formulaire est invalide. Vérifiez les champs requis.');
      return;
    }

    this.isLoading.set(true);

    try {
      const rawData = this.projectForm.getRawValue();
      console.log('Form data:', rawData);

      // Validation des champs requis
      if (!rawData.category) {
        this.toastService.danger('Erreur', 'La catégorie est requise.');
        return;
      }

      if (!rawData.date) {
        this.toastService.danger('Erreur', 'La date est requise.');
        return;
      }

      const formData: CreateProjectDto = {
        title: rawData.title ?? "",
        description: rawData.description ?? "",
        technologies: rawData.technologies ?? [],
        demoUrl: rawData.demo_url ?? undefined,
        category: rawData.category,
        featured: rawData.featured ?? false,
        status: 'ACTIVE' as ProjectStatus,
        date: rawData.date,
        githubUrlFrontend: rawData.github_urls?.frontend ?? undefined,
        githubUrlBackend: rawData.github_urls?.backend ?? undefined,
        githubUrlFullstack: rawData.github_urls?.fullstack ?? undefined,
      };

      console.log('Processed form data:', formData);

      if (this.isEditMode() && this.currentProject()) {
        // Mode édition
        const projectValue = this.currentProject()!;
        const updateData: UpdateProjectDto = {
          title: formData.title,
          description: formData.description,
          technologies: formData.technologies,
          demoUrl: formData.demoUrl,
          category: formData.category,
          featured: formData.featured,
          status: formData.status,
          date: formData.date,
          githubUrlFrontend: formData.githubUrlFrontend,
          githubUrlBackend: formData.githubUrlBackend,
          githubUrlFullstack: formData.githubUrlFullstack,
        };
        console.log('Updating project:', projectValue.id, updateData);

        const result = await this.projectService.updateProject(
          projectValue.id,
          updateData,
          this.selectedFile ?? undefined,
        );
        console.log('Update result:', result);

        // Mettre à jour le projet courant et l'aperçu d'image
        this.currentProject.set(result);
        if (result.imagePath) {
          this.imagePreview.set(this.projectService.getImageUrl(result.imagePath));
        }

        this.toastService.success('Succès', 'Projet mis à jour avec succès !');
      } else {
        // Mode création - Une image est requise
        if (!this.selectedFile) {
          this.toastService.danger('Erreur', 'Une image est requise pour créer un projet.');
          return;
        }

        console.log('Creating new project:', formData);
        const result = await this.projectService.createProject(formData, this.selectedFile);
        console.log('Creation result:', result);

        // Mettre à jour le projet courant et l'aperçu d'image après création
        this.currentProject.set(result);
        this.isEditMode.set(true);
        if (result.imagePath) {
          this.imagePreview.set(this.projectService.getImageUrl(result.imagePath));
        }

        this.toastService.success('Succès', 'Projet ajouté avec succès !');
      }

      // Réinitialiser seulement le fichier sélectionné, pas l'aperçu en mode édition
      this.selectedFile = null;
    } catch (error) {
      console.error('Error in onSubmit:', error);
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue.";
      this.toastService.danger('Erreur', `Erreur: ${message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(): void {
    this.projectForm.markAllAsTouched();
  }
}
