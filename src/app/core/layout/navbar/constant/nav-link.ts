import { NavLink } from '../interface/nav-link';

export const NAV_LINKS: NavLink[] = [
  { label: 'Accueil', route: '/', icon: 'lucide:house' },
  { label: 'À propos', route: '/about', icon: 'lucide:user' },
  { label: 'Compétences', route: '/skills', icon: 'lucide:database' },
  { label: 'Projets', route: '/projects', icon: 'lucide:code' },
  { label: 'Contact', route: '/contact', icon: 'lucide:mail' },
  { label: 'Blog', route: '/blog', icon: 'lucide:notebook-pen' },
];
