import { Routes } from "@angular/router";
import { adminGuard } from "@core/guards/admin-guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("@features/landing/landing").then((m) => m.Landing),
  },
  {
    path: "about",
    loadComponent: () =>
      import("@features/about/about").then((m) => m.About),
  },
  {
    path: "skills",
    loadComponent: () =>
      import("@features/skills/skills").then((m) => m.Skills),
  },
  {
    path: "projects",
    loadComponent: () =>
      import("@features/projects/project").then((m) => m.Project),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("@features/contact/contact").then((m) => m.Contact),
  },
  // Routes d'authentification
  {
    path: "login",
    loadComponent: () =>
      import("@features/auth/login/login-form/login-form").then((m) => m.LoginFormComponent),
  },
  {
    path: "unauthorized",
    loadComponent: () =>
      import("@features/unauthorized/unauthorized").then((m) => m.UnauthorizedComponent),
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
          import("@features/badge/components/edit-badge/edit-badge").then((m) => m.EditBadge),
      },
      {
        path: "badges/create",
        loadComponent: () =>
          import("@features/badge/components/edit-badge/edit-badge").then((m) => m.EditBadge),
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
          import("@features/cv/admin/cv").then((m) => m.CvAdminPage),
      },
      {
        path: "cv/upload",
        loadComponent: () =>
          import("@features/cv/admin/cv").then((m) => m.CvAdminPage),
      },
      // Routes Projets
      {
        path: "projects",
        loadComponent: () =>
          import("@features/projects/components/project-manager").then((m) => m.ProjectManagerComponent),
      },
      {
        path: "projects/create",
        loadComponent: () =>
          import("@features/projects/components/project-form/project-form").then((m) => m.ProjectFormComponent),
      },
      {
        path: "projects/edit/:id",
        loadComponent: () =>
          import("@features/projects/components/project-form/project-form").then((m) => m.ProjectFormComponent),
      },
      // Routes Messages
      {
        path: "contacts",
        loadComponent: () =>
          import("@features/contact/admin/messages").then((m) => m.AdminMessagesPage),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
];
