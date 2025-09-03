import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'about',
    loadComponent: () => import('@features/about/about').then((m) => m.About),
  },
  {
    path: 'skills',
    loadComponent: () => import('@features/skills').then((m) => m.SkillsComponent),
  },
  {
    path: 'projects',
    loadComponent: () => import('@features/projects').then((m) => m.ProjectsComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('@features/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'admin',
    loadComponent: () => import('@features/admin/admin').then((m) => m.Admin),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'cv',
        loadComponent: () => import('@features/cv').then((m) => m.CvAdminComponent),
      },
      {
        path: 'badges',
        loadComponent: () =>
          import('@features/badge/pages/badges-admin').then((m) => m.BadgesAdmin),
      },
      {
        path: 'badges/edit',
        loadComponent: () =>
          import('@features/badge/pages/badges-admin').then((m) => m.BadgesAdmin),
      },

      {
        path: 'projects',
        loadComponent: () =>
          import('@features/projects/components/project-manager').then(
            (m) => m.ProjectManagerComponent,
          ),
      },
      {
        path: 'projects/create',
        loadComponent: () =>
          import('@features/projects/components/project-form/project-form').then(
            (m) => m.ProjectFormComponent,
          ),
      },
      {
        path: 'projects/edit/:id',
        loadComponent: () =>
          import('@features/projects/components/project-form/project-form').then(
            (m) => m.ProjectFormComponent,
          ),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('@features/contact/admin/messages').then((m) => m.AdminMessagesPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
    ],
  },
];
