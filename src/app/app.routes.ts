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
        path: 'users',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'skills',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('@features/admin/pages/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
    ],
  },
];
