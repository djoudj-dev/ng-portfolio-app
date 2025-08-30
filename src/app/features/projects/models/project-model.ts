import {
  ProjectCategory,
  ProjectStatus,
} from "@features/projects/enums/project-enum";

export interface GithubUrls {
  frontend?: string | null;
  backend?: string | null;
  fullstack?: string | null;
}

// Modèle principal (backend response - ProjectResponseDto)
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
  date: string;
  createdAt: string;
  updatedAt: string;
}

// Modèle côté client (plus flexible, pour compatibilité avec données statiques)
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imagePath?: string | null;
  githubUrls?: GithubUrls;
  demoUrl?: string | null;
  category: ProjectCategory | null;
  featured: boolean;
  status?: ProjectStatus;
  date: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Interface pour les filtres
export interface ProjectFilter {
  label: string;
  value: ProjectCategory | "all";
  active: boolean;
}

// DTO pour création de projet (backend)
export interface CreateProjectDto {
  title: string;
  description: string;
  technologies: string[];
  githubUrlFrontend?: string;
  githubUrlBackend?: string;
  githubUrlFullstack?: string;
  demoUrl?: string;
  category: ProjectCategory;
  featured: boolean;
  status: ProjectStatus;
  date: string;
}

// DTO pour mise à jour de projet (backend)
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

// DTO pour filtrage de projets (backend)
export interface ProjectFilterDto {
  search?: string;
  category?: ProjectCategory;
  status?: ProjectStatus;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Réponse paginée du backend
export interface ProjectPaginatedResponse {
  projects: ProjectModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
