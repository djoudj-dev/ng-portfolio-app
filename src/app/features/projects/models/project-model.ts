// Import des enums depuis le fichier dédié
import { ProjectCategory, ProjectStatus } from '@features/projects/enums/project-enum';

// Interface pour les URLs GitHub conforme au backend
export interface GithubUrls {
  frontend?: string | null;
  backend?: string | null;
  fullstack?: string | null;
}

// Interface principale du projet conforme au backend NestJS
export interface ProjectModel {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imagePath?: string | null;
  githubUrls?: GithubUrls;
  demoUrl?: string | null;
  category: ProjectCategory;
  featured: boolean;
  status: ProjectStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // Propriétés legacy pour compatibilité
  githubUrlFrontend?: string | null;
  githubUrlBackend?: string | null;
  githubUrlFullstack?: string | null;
}

// DTO pour la création de projet
export interface CreateProjectDto {
  title: string;
  description: string;
  technologies: string[];
  githubUrlFrontend?: string;
  githubUrlBackend?: string;
  githubUrlFullstack?: string;
  demoUrl?: string;
  category: ProjectCategory;
  featured?: boolean;
  status?: ProjectStatus;
  date: string; // ISO string format for API
}

// DTO pour la mise à jour de projet
export interface UpdateProjectDto {
  title?: string;
  description?: string;
  technologies?: string[];
  githubUrlFrontend?: string;
  githubUrlBackend?: string;
  githubUrlFullstack?: string;
  demoUrl?: string;
  category?: ProjectCategory;
  featured?: boolean;
  status?: ProjectStatus;
  date?: string;
}

// DTO pour le filtrage des projets
export interface ProjectFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  sortBy?: 'title' | 'date' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Réponse paginée conforme à l'architecture NestJS
export interface ProjectPaginatedResponse {
  projects: ProjectModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DTO de réponse pour les projets
export interface ProjectResponseDto {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imagePath?: string | null;
  githubUrlFrontend?: string | null;
  githubUrlBackend?: string | null;
  githubUrlFullstack?: string | null;
  demoUrl?: string | null;
  category: ProjectCategory;
  featured: boolean;
  status: ProjectStatus;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type aliases pour la compatibilité avec les données existantes
export type ProjectData = ProjectModel;

// Interface pour les filtres UI (boutons de filtrage)
export interface ProjectFilter {
  label: string;
  value: ProjectCategory | 'all';
  active: boolean;
}

// Type alias pour l'API
export type ProjectFilterParams = ProjectFilterDto;
