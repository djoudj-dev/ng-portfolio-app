import { Routes } from '@angular/router';
import { adminGuard } from '@core/guards/admin';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout').then((m) => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard.page').then((m) => m.AdminDashboard),
      },
      {
        path: 'badges',
        loadComponent: () =>
          import('./features/badge/pages/badges-admin').then((m) => m.BadgesAdmin),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/messages/pages/messages.page').then((m) => m.AdminMessagesPage),
      },
      {
        path: 'cv',
        loadComponent: () =>
          import('./features/cv/pages/cv-admin.page').then((m) => m.CvAdminComponent),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('@features/projects/components/project-manager').then((m) => m.ProjectManagerComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/pages/settings.page').then((m) => m.AdminSettingsPage),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
