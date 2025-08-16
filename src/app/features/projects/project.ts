import { NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { PROJECT_FILTERS } from "./data/project-data";
import {
  ProjectCategory,
  ProjectData,
  ProjectFilter,
} from "./interface/project-data";
import { ProjectPagination } from "@features/projects/components/project-pagination/project-pagination";
import { ProjectSearch } from "@features/projects/components/project-search/project-search";
import { ProjectService } from "./services/project-service";
import { Router } from "@angular/router";

@Component({
  selector: "app-project",
  imports: [NgOptimizedImage, ProjectSearch, ProjectPagination],
  templateUrl: "./project.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Project implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  // Titles
  readonly projectTitle = signal<string>("Mes Projets");
  readonly projectSubTitle = signal<string>(
    "Découvrez mes réalisations et projets personnels",
  );

  // Projects data
  readonly allProjects = signal<ProjectData[]>([]);
  readonly filters = signal<ProjectFilter[]>(PROJECT_FILTERS);

  // Search and filter state
  readonly searchQuery = signal<string>("");
  readonly activeFilter = signal<ProjectCategory | "all">("all");

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly projectsPerPage = 3;

  async ngOnInit(): Promise<void> {
    const projects = await this.projectService.getProjects();
    this.allProjects.set(projects);
  }

  // Computed filtered projects
  readonly filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.activeFilter();

    return this.allProjects().filter((project) => {
      if (filter !== "all" && project.category !== filter) {
        return false;
      }

      if (query) {
        return (
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(query),
          )
        );
      }

      return true;
    });
  });

  readonly paginatedProjects = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.projectsPerPage;
    const endIndex = startIndex + this.projectsPerPage;
    return this.filteredProjects().slice(startIndex, endIndex);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.filteredProjects().length / this.projectsPerPage);
  });

  // Methods
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set("");
    this.currentPage.set(1);
  }

  setFilter(filter: ProjectCategory | "all"): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
    this.filters.update((filters) =>
      filters.map((f) => ({ ...f, active: f.value === filter })),
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getProjectImageUrl(imagePath: string): string {
    return this.projectService.getPublicUrl(imagePath);
  }

  // Helper methods to reduce template complexity
  hasGithubUrls(project: ProjectData): boolean {
    return !!(
      project.github_urls?.frontend ??
      project.github_urls?.backend ??
      project.github_urls?.fullstack
    );
  }

  getGithubLinks(
    project: ProjectData,
  ): Array<{ href: string; label: string; ariaLabel: string }> {
    const links: Array<{ href: string; label: string; ariaLabel: string }> = [];

    if (project.github_urls?.frontend) {
      links.push({
        href: project.github_urls.frontend,
        label: "GitHub Front",
        ariaLabel: "Voir le code source frontend sur GitHub",
      });
    }

    if (project.github_urls?.backend) {
      links.push({
        href: project.github_urls.backend,
        label: "GitHub Back",
        ariaLabel: "Voir le code source backend sur GitHub",
      });
    }

    if (project.github_urls?.fullstack) {
      links.push({
        href: project.github_urls.fullstack,
        label: "GitHub",
        ariaLabel: "Voir le code source sur GitHub",
      });
    }

    return links;
  }

  getAllProjectLinks(
    project: ProjectData,
  ): Array<{ href: string; label: string; ariaLabel: string }> {
    const links = this.getGithubLinks(project);

    if (project.demo_url) {
      links.push({
        href: project.demo_url,
        label: "Démo",
        ariaLabel: "Voir la démo du projet",
      });
    }

    return links;
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }
}
