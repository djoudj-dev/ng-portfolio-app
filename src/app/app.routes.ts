import { Routes } from "@angular/router";
import { publicGuard, adminGuard, crudGuard } from "@core/guards/access-guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("@features/landing/landing").then((m) => m.Landing),
    canActivate: [publicGuard],
  },
  {
    path: "about",
    loadComponent: () => 
      import("@features/about/about").then((m) => m.About),
    canActivate: [publicGuard],
  },
  {
    path: "skills",
    loadComponent: () => 
      import("@features/skills/skills").then((m) => m.Skills),
    canActivate: [publicGuard],
  },
  {
    path: "projects",
    loadComponent: () => 
      import("@features/projects/project").then((m) => m.Project),
    canActivate: [publicGuard],
  },
  {
    path: "contact",
    loadComponent: () => 
      import("@features/contact/contact").then((m) => m.Contact),
    canActivate: [publicGuard],
  },
  // Routes d'administration sécurisées
  {
    path: "admin",
    canActivate: [adminGuard],
    loadComponent: () =>
      import("@features/admin/components/admin-layout/admin-layout").then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "dashboard",
        loadComponent: () =>
          import("@features/admin/pages/overview/overview").then((m) => m.AdminOverviewComponent),
      },
      // Routes Badges
      {
        path: "badges",
        loadComponent: () =>
          import("@features/admin/pages/badges/badge-manager").then((m) => m.BadgeManagerComponent),
      },
      {
        path: "badges/create",
        loadComponent: () =>
          import("@features/landing/badge/components/edit-badge/edit-badge").then((m) => m.EditBadge),
        canActivate: [crudGuard],
      },
      // Routes CV
      {
        path: "cv",
        redirectTo: "cv/edit",
        pathMatch: "full",
      },
      {
        path: "cv/edit",
        loadComponent: () =>
          import("@features/admin/pages/cv/cv-manager").then((m) => m.CvManagerComponent),
      },
      {
        path: "cv/upload",
        loadComponent: () =>
          import("@features/admin/pages/cv/edit-cv/edit-cv").then((m) => m.EditCvComponent),
        canActivate: [crudGuard],
      },
      // Routes Projets
      {
        path: "projects",
        loadComponent: () =>
          import("@features/admin/pages/projects/project-manager").then((m) => m.ProjectManagerComponent),
      },
      {
        path: "projects/create",
        loadComponent: () =>
          import("@features/projects/components/project-form/project-form").then((m) => m.ProjectFormComponent),
        canActivate: [crudGuard],
      },
      {
        path: "projects/edit/:id",
        loadComponent: () =>
          import("@features/projects/components/project-form/project-form").then((m) => m.ProjectFormComponent),
        canActivate: [crudGuard],
      },
      // Routes Messages
      {
        path: "contacts",
        loadComponent: () =>
          import("@features/admin/pages/overview/overview").then((m) => m.AdminOverviewComponent), // Placeholder
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
