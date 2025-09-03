import { ProjectCategory, ProjectStatus } from '@features/projects/enums/project-enum';

export interface GithubUrls {
  frontend?: string | null;
  backend?: string | null;
  fullstack?: string | null;
}

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

  githubUrlFrontend?: string | null;
  githubUrlBackend?: string | null;
  githubUrlFullstack?: string | null;
}

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
  date: string;
}

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

export interface ProjectPaginatedResponse {
  projects: ProjectModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

export type ProjectData = ProjectModel;

export interface ProjectFilter {
  label: string;
  value: ProjectCategory | 'all';
  active: boolean;
}

export type ProjectFilterParams = ProjectFilterDto;
