import { ChangeDetectionStrategy, Component, inject, input, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button';
import { CustomMultiSelectComponent } from '@features/projects/components/custom-multi-select/custom-multi-select';

import { TECHNOLOGIES } from '@features/projects/data/technologies';
import { ProjectService } from '@features/projects/services/project-service';
import { ToastService } from '@shared/ui/toast/service/toast-service';
import {
  ProjectModel,
  CreateProjectDto,
  UpdateProjectDto,
} from '@features/projects/models/project-model';
import { ProjectCategory, ProjectStatus } from '@features/projects/enums/project-enum';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule, ButtonComponent, CustomMultiSelectComponent, NgOptimizedImage],
  templateUrl: './project-form.html',
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
  currentImageUrl = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  isLoading = signal(false);
  isEditMode = signal(false);

  technologies = TECHNOLOGIES;

  projectForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
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

  constructor() {}

  private setupFormWithProject(project: ProjectModel) {
    this.initializeFormWithProject(project);
    this.isEditMode.set(true);
    if (project.imagePath) {
      this.currentImageUrl.set(this.projectService.getImageUrl(project.imagePath));
    } else {
      this.currentImageUrl.set(null);
    }
    this.currentProject.set(project);
  }

  async ngOnInit(): Promise<void> {
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      try {
        this.isLoading.set(true);
        const project = await this.projectService.getProjectById(projectId);
        this.setupFormWithProject(project);
      } catch (error) {
        this.toastService.danger('Erreur', 'Erreur lors du chargement du projet');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.isEditMode.set(false);
    }
  }

  private initializeFormWithProject(project: ProjectModel): void {
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
      },
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
      this.imagePreview.set(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched();
      this.toastService.danger(
        'Formulaire invalide',
        'Le formulaire est invalide. Vérifiez les champs requis.',
      );
      return;
    }

    this.isLoading.set(true);

    try {
      const rawData = this.projectForm.getRawValue();

      if (!rawData.category) {
        this.toastService.danger('Erreur', 'La catégorie est requise.');
        return;
      }

      if (!rawData.date) {
        this.toastService.danger('Erreur', 'La date est requise.');
        return;
      }

      const formData: CreateProjectDto = {
        title: rawData.title ?? '',
        description: rawData.description ?? '',
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

        this.setupFormWithProject(result);
        this.imagePreview.set(null);

        this.toastService.success('Succès', 'Projet mis à jour avec succès !');
      } else {
        if (!this.selectedFile) {
          this.toastService.danger('Erreur', 'Une image est requise pour créer un projet.');
          return;
        }

        const result = await this.projectService.createProject(formData, this.selectedFile);
        this.setupFormWithProject(result);
        this.imagePreview.set(null);

        this.toastService.success('Succès', 'Projet ajouté avec succès !');
      }

      this.selectedFile = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      this.toastService.danger('Erreur', `Erreur: ${message}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private markFormGroupTouched(): void {
    this.projectForm.markAllAsTouched();
  }
}
