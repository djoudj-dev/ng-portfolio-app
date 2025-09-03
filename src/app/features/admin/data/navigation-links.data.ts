import { NavigationLink } from '../interfaces/navigation-link.interface';

export const NAVIGATION_LINKS: NavigationLink[] = [
  {
    label: 'Dashboard',
    route: '',
    icon: '/icons/dashboard.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'CV',
    route: 'cv',
    icon: '/icons/cv.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Badges',
    route: 'badges',
    icon: '/icons/badge.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Projets',
    route: 'projects',
    icon: '/icons/project.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Messages',
    route: 'contacts',
    icon: '/icons/contact.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
  {
    label: 'Paramètres',
    route: 'settings',
    icon: '/icons/settings.svg',
    colorClasses: 'text-text bg-background hover:bg-accent border-accent',
  },
];
