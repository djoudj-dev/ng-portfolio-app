export interface CounterCardConfig {
  id: string;
  icon: string;
  alt: string;
  title: string;
}

export const COUNTER_CARDS_CONFIG: CounterCardConfig[] = [
  {
    id: 'cv',
    icon: '/icons/cv.svg',
    alt: 'Téléchargements CV',
    title: 'Téléchargements du CV',
  },
  {
    id: 'projects',
    icon: '/icons/project.svg',
    alt: 'Projets',
    title: 'Projets créés',
  },
  {
    id: 'month',
    icon: '/icons/calendar.svg',
    alt: 'Analytics',
    title: 'Visites ce mois',
  },
  {
    id: 'year',
    icon: '/icons/calendar.svg',
    alt: 'Calendrier',
    title: 'Visites cette année',
  },
];
