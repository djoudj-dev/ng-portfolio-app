export interface CounterCardConfig {
  id: string;
  icon: string;
  alt: string;
  title: string;
}

export const COUNTER_CARDS_CONFIG: CounterCardConfig[] = [
  {
    id: 'cv',
    icon: 'lucide:file',
    alt: 'Téléchargements CV',
    title: 'Téléchargements du CV',
  },
  {
    id: 'projects',
    icon: 'lucide:code-xml',
    alt: 'Projets',
    title: 'Projets créés',
  },
  {
    id: 'month',
    icon: 'lucide:calendar-days',
    alt: 'Analytics',
    title: 'Visites ce mois',
  },
  {
    id: 'year',
    icon: 'lucide:calendar-1',
    alt: 'Calendrier',
    title: 'Visites cette année',
  },
];

export const BIG_COUNTER_CARDS_CONFIG: CounterCardConfig[] = [
  {
    id: 'visitors',
    icon: '/icons/users.svg',
    alt: 'Répartition visiteurs',
    title: 'Visiteurs & Bots',
  },
  {
    id: 'realtime',
    icon: '/icons/activity.svg',
    alt: 'Activité temps réel',
    title: 'Activité en temps réel',
  },
];
