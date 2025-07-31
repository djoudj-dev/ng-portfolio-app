export interface GithubUrls {
  frontend?: string | null;
  backend?: string | null;
  fullstack?: string | null;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_path: string;
  github_urls?: GithubUrls;
  demo_url?: string;
  category: ProjectCategory | null;
  featured: boolean;
  date: string | null;
}

export type ProjectCategory = "frontend" | "backend" | "fullstack" | "script";

export interface ProjectFilter {
  label: string;
  value: ProjectCategory | "all";
  active: boolean;
}
