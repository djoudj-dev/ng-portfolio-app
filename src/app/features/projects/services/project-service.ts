import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environment';
import {
  ProjectModel,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  ProjectPaginatedResponse,
} from '@features/projects/models/project-model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  async getAllProjects(filters: ProjectFilterDto = {}): Promise<ProjectPaginatedResponse> {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const url = params.toString() ? `${this.apiUrl}?${params}` : this.apiUrl;

    try {
      return await firstValueFrom(
        this.http.get<ProjectPaginatedResponse>(url, { withCredentials: true }),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<ProjectModel> {
    try {
      return await firstValueFrom(
        this.http.get<ProjectModel>(`${this.apiUrl}/${id}`, { withCredentials: true }),
      );
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      throw error;
    }
  }

  async getFeaturedProjects(limit: number = 6): Promise<ProjectModel[]> {
    try {
      return await firstValueFrom(
        this.http.get<ProjectModel[]>(`${this.apiUrl}/featured/list?limit=${limit}`, {
          withCredentials: true,
        }),
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des projets mis en avant:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau projet avec upload d'image optionnel.
   * Authentication is handled automatically by the auth interceptor.
   */
  async createProject(projectData: CreateProjectDto, imageFile?: File): Promise<ProjectModel> {
    const formData = this.buildFormData(projectData, imageFile);

    try {
      return await firstValueFrom(
        this.http.post<ProjectModel>(this.apiUrl, formData, { withCredentials: true }),
      );
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  }

  /**
   * Met à jour un projet existant.
   * Authentication is handled automatically by the auth interceptor.
   */
  async updateProject(
    id: string,
    projectData: UpdateProjectDto,
    imageFile?: File,
  ): Promise<ProjectModel> {
    const formData = this.buildFormData(projectData, imageFile);

    try {
      return await firstValueFrom(
        this.http.put<ProjectModel>(`${this.apiUrl}/${id}`, formData, { withCredentials: true }),
      );
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un projet.
   * Authentication is handled automatically by the auth interceptor.
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true }),
      );
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      throw error;
    }
  }

  /**
   * Construit un FormData à partir des données du projet et du fichier image.
   */
  private buildFormData(
    projectData: CreateProjectDto | UpdateProjectDto,
    imageFile?: File,
  ): FormData {
    const formData = new FormData();

    // Log des données avant construction
    console.log('Building FormData with project data:', projectData);
    console.log('Image file:', imageFile);

    // Ajouter les champs du projet
    Object.entries(projectData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'technologies' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
          console.log(`FormData - ${key}:`, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
          console.log(`FormData - ${key}:`, value.toString());
        } else if (key === 'category') {
          // Convert category to uppercase to match backend enum
          const uppercaseCategory = value.toString().toUpperCase();
          formData.append(key, uppercaseCategory);
          console.log(`FormData - ${key}:`, uppercaseCategory);
        } else {
          formData.append(key, value.toString());
          console.log(`FormData - ${key}:`, value.toString());
        }
      }
    });

    // Ajouter le fichier image si présent
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
      console.log('FormData - image:', imageFile.name, imageFile.type, imageFile.size);
    }

    // Log du FormData final
    console.log('Final FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    return formData;
  }
  /**
   * Génère une URL publique pour les images (fallback pour le développement).
   */
  getImageUrl(imagePath?: string | null): string {
    if (!imagePath) {
      return 'https://via.placeholder.com/400x300?text=No+Image';
    }

    // Si c'est déjà une URL complète, la retourner telle quelle
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Construire l'URL complète avec l'API et ajouter un timestamp pour éviter le cache
    const cleanPath = imagePath.replace(/^\/+/, '');
    const timestamp = new Date().getTime();
    return `${environment.apiUrl}/${cleanPath}?t=${timestamp}`;
  }
}
