import { NavigationLink } from '@features/admin';

export const NAVIGATION_LINKS: NavigationLink[] = [
  {
    label: 'Dashboard',
    route: '',
    icon: 'lucide:layout-dashboard',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'CV',
    route: 'cv',
    icon: 'lucide:file',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Badges',
    route: 'badges',
    icon: 'lucide:file-badge-2',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Projets',
    route: 'projects',
    icon: 'lucide:code-xml',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Messages',
    route: 'messages',
    icon: 'lucide:mail',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Paramètres',
    route: 'settings',
    icon: 'lucide:settings',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
];
