import { CertificationData, SkillCategoryData } from '../interface/skill-data';

export const SKILL_CATEGORIES: SkillCategoryData[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      {
        id: 'angular',
        title: 'Angular',
        icon: 'devicon:angular',
        url: 'https://angular.io/',
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        icon: 'devicon:typescript',
        url: 'https://www.typescriptlang.org/',
      },
      {
        id: 'rxjs',
        title: 'RxJS',
        icon: 'devicon:rxjs',
        url: 'https://rxjs.dev/',
      },
      {
        id: 'html',
        title: 'HTML5',
        icon: 'devicon:html5',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      },
      {
        id: 'css',
        title: 'CSS3',
        icon: 'devicon:css3',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      },
      {
        id: 'javascript',
        title: 'Javascript',
        icon: 'devicon:javascript',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
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
        icon: 'devicon:nestjs',
        url: 'https://nestjs.com/',
      },
      {
        id: 'java',
        title: 'Java',
        icon: 'devicon:java',
        url: 'https://www.java.com/',
      },
      {
        id: 'postgresql',
        title: 'PostgreSQL',
        icon: 'devicon:postgresql',
        url: 'https://www.postgresql.org/',
      },
      {
        id: 'mongodb',
        title: 'MongoDB',
        icon: 'devicon:mongodb',
        url: 'https://www.mongodb.com/',
      },
      {
        id: 'mysql',
        title: 'MySQL',
        icon: 'devicon:mysql',
        url: 'https://www.mysql.com/',
      },
      {
        id: 'supabase',
        title: 'Supabase',
        icon: 'devicon:supabase',
        url: 'https://supabase.com/',
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
        icon: 'devicon:git',
        url: 'https://git-scm.com/',
      },
      {
        id: 'githubactions',
        title: 'GitHub Actions',
        icon: 'devicon:githubactions',
        url: 'https://github.com/features/actions',
      },
      {
        id: 'docker',
        title: 'Docker',
        icon: 'devicon:docker',
        url: 'https://www.docker.com/',
      },
      {
        id: 'linux',
        title: 'Linux',
        icon: 'devicon:linux',
        url: 'https://www.linux.org/',
      },
      {
        id: 'webstorm',
        title: 'Webstorm',
        icon: 'devicon:webstorm',
        url: 'https://www.jetbrains.com/webstorm/',
      },
      {
        id: 'vscode',
        title: 'VsCode',
        icon: 'devicon:vscode',
        url: 'https://code.visualstudio.com/',
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
