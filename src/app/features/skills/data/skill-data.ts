import { CertificationData, SkillCategoryData } from '../interface/skill-data';

export const SKILL_CATEGORIES: SkillCategoryData[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      {
        id: 'html',
        title: 'HTML5',
        icon: 'icons/html5.svg',
      },
      {
        id: 'css',
        title: 'CSS3',
        icon: 'icons/css3.svg',
      },
      {
        id: 'javascript',
        title: 'Javascript',
        icon: 'icons/javascript.svg',
      },
      {
        id: 'angular',
        title: 'Angular',
        icon: 'icons/angular.webp',
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        icon: 'icons/typescript.svg',
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    skills: [
      {
        id: 'nestjs',
        title: 'NestJS',
        icon: 'icons/nestjs.svg',
      },
      {
        id: 'java',
        title: 'Java',
        icon: 'icons/java.svg',
      },
      {
        id: 'postgresql',
        title: 'PostgreSQL',
        icon: 'icons/postgresql.svg',
      },
      {
        id: 'mongodb',
        title: 'MongoDB',
        icon: 'icons/mongodb.svg',
      },
      {
        id: 'mysql',
        title: 'MySQL',
        icon: 'icons/mysql.svg',
      },
    ],
  },
  {
    id: 'tools',
    title: 'Outils & Techniques',
    skills: [
      {
        id: 'git',
        title: 'Git',
        icon: 'icons/git.svg',
      },
      {
        id: 'docker',
        title: 'Docker',
        icon: 'icons/docker.svg',
      },
      {
        id: 'linux',
        title: 'Linux',
        icon: 'icons/linux.svg',
      },
      {
        id: 'webstorm',
        title: 'Webstorm',
        icon: 'icons/webstorm.svg',
      },
      {
        id: 'vscode',
        title: 'VsCode',
        icon: 'icons/vscode.svg',
      },
    ],
  },
];

export const CERTIFICATIONS: CertificationData[] = [
  {
    id: 'dwwm',
    title: 'Développeur Web et Web Mobile (DWWM)',
    description:
      "Titre professionnel de niveau 5 (Bac +2) reconnu par l’État, orienté vers la conception, le développement et la maintenance d'applications web et mobiles. Formation dispensée par Studi, intégrant les bonnes pratiques du développement moderne (frontend, backend, bases de données, API) ainsi qu'une initiation à la gestion de projet agile et au travail en équipe.",
    status: 'Obtenu en 2025',
    year: '2025',
    skillsLearned: [
      'HTML5 & CSS3 & JavaScript',
      'Angular & TypeScript',
      'SQL & NoSQL',
      'Git & GitHub',
      'Responsive Design',
      'API REST',
      'Méthodes Agiles',
    ],
  },
  {
    id: 'pgi/erp1',
    title: "Développeur d'applications PGI/ERP 1",
    description:
      'Titre professionnel de niveau 5 (Bac +2) reconnu par l’État, orienté vers la conception,' +
      ' le développement et la maintenance d’applications de gestion intégrées (PGI/ERP).' +
      ' Formation dispensée par ALT-RH, couvrant l’ensemble du cycle de développement.' +
      ' L’approche pédagogique met l’accent sur les bonnes pratiques du développement logiciel,' +
      ' la structuration d’architecture applicative et le travail en équipe.',
    status: 'Obtenu en 2023',
    skillsLearned: [
      'HTML5 / CSS3 / JavaScript / jQuery',
      'Java / J2EE',
      'MySQL / UML & modélisation',
      'Git & gestion de version',
      'Algorithmique / Design patterns / Architecture logicielle',
      'Méthodes Agiles (Scrum, RUP)',
    ],
  },
];
