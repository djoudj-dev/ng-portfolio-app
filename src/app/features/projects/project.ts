import { DatePipe, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { PROJECT_FILTERS } from './data/project-data';
import { ProjectFilter, ProjectModel, ProjectFilterDto } from './models/project-model';
import { ProjectPagination } from '@features/projects/components/project-pagination/project-pagination';
import { ProjectSearch } from '@features/projects/components/project-search/project-search';
import { ProjectService } from './services/project-service';
import { Router } from '@angular/router';
import { ProjectCategory } from '@features/projects/enums/project-enum';
import { TECHNOLOGIES, Technology } from '@features/projects/data/technologies';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';

@Component({
  imports: [NgOptimizedImage, ProjectSearch, ProjectPagination, DatePipe, SvgIcon],
  templateUrl: './project.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Project implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  readonly projectTitle = 'Mes Projets';
  readonly projectSubTitle = 'Découvrez mes réalisations et projets personnels';

  readonly allProjects = signal<ProjectModel[]>([]);
  readonly filters = signal<ProjectFilter[]>(PROJECT_FILTERS);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  readonly searchQuery = signal<string>('');
  readonly activeFilter = signal<ProjectCategory | 'all'>('all');

  readonly currentPage = signal<number>(1);
  readonly totalPages = signal<number>(0);
  readonly totalProjects = signal<number>(0);
  readonly projectsPerPage = 3;
  readonly hydratedProjects = signal<Set<string>>(new Set());

  async ngOnInit(): Promise<void> {
    await this.loadProjects();
  }

  private async loadProjects(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const filterParams: ProjectFilterDto = {
        search: this.searchQuery() || undefined,
        category:
          this.activeFilter() !== 'all' ? (this.activeFilter() as ProjectCategory) : undefined,
        page: this.currentPage(),
        limit: this.projectsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await this.projectService.getAllProjects(filterParams);

      this.allProjects.set(response.projects);
      this.totalPages.set(response.totalPages);
      this.totalProjects.set(response.total);
    } catch {
      this.error.set('Erreur lors du chargement des projets');
    } finally {
      this.loading.set(false);
    }
  }

  async onSearch(query: string): Promise<void> {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    await this.loadProjects();
  }

  async clearSearch(): Promise<void> {
    this.searchQuery.set('');
    this.currentPage.set(1);
    await this.loadProjects();
  }

  async setFilter(filter: ProjectCategory | 'all'): Promise<void> {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.filters.update((filters) => filters.map((f) => ({ ...f, active: f.value === filter })));
    await this.loadProjects();
  }

  async goToPage(page: number): Promise<void> {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      await this.loadProjects();
    }
  }

  getProjectImageUrl(imagePath?: string | null): string {
    return this.projectService.getImageUrl(imagePath);
  }

  hasGithubUrls(project: ProjectModel): boolean {
    return !!(
      project.githubUrls?.frontend ??
      project.githubUrls?.backend ??
      project.githubUrls?.fullstack
    );
  }

  getGithubLinks(
    project: ProjectModel,
  ): Array<{ href: string; label: string; ariaLabel: string; icon: string }> {
    const links: Array<{ href: string; label: string; ariaLabel: string; icon: string }> = [];

    if (project.githubUrls?.frontend) {
      links.push({
        href: project.githubUrls.frontend,
        label: 'GitHub Front',
        ariaLabel: 'Voir le code source frontend sur GitHub',
        icon: 'simple-icons:github',
      });
    }

    if (project.githubUrls?.backend) {
      links.push({
        href: project.githubUrls.backend,
        label: 'GitHub Back',
        ariaLabel: 'Voir le code source backend sur GitHub',
        icon: 'simple-icons:github',
      });
    }

    if (project.githubUrls?.fullstack) {
      links.push({
        href: project.githubUrls.fullstack,
        label: 'GitHub',
        ariaLabel: 'Voir le code source sur GitHub',
        icon: 'simple-icons:github',
      });
    }

    return links;
  }

  getAllProjectLinks(
    project: ProjectModel,
  ): Array<{ href: string; label: string; ariaLabel: string; icon: string }> {
    const links = this.getGithubLinks(project);

    if (project.demoUrl) {
      links.push({
        href: project.demoUrl,
        label: 'Démo',
        ariaLabel: 'Voir la démo du projet',
        icon: 'lucide:external-link',
      });
    }

    return links;
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  getTechnologyWithIcon(techName: string): Technology | null {
    return TECHNOLOGIES.find((tech) => tech.name.toLowerCase() === techName.toLowerCase()) ?? null;
  }

  hydrateProject(projectId: string): void {
    this.hydratedProjects.update((hydrated) => new Set([...hydrated, projectId]));
  }

  dehydrateProject(projectId: string): void {
    this.hydratedProjects.update((hydrated) => {
      const newHydrated = new Set(hydrated);
      newHydrated.delete(projectId);
      return newHydrated;
    });
  }

  isProjectHydrated(projectId: string): boolean {
    return this.hydratedProjects().has(projectId);
  }
}
