import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';
import { type Diploma } from './components/diploma-card';
import { type Highlight } from './components/highlight-card';
import { DiplomasSectionComponent } from './components/diplomas-section';
import { HighlightsSectionComponent } from './components/highlights-section';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [SvgIcon, DiplomasSectionComponent, HighlightsSectionComponent],
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly router = inject(Router);

  private readonly defaultDisplayName = 'Julien NÉDELLEC';
  private readonly defaultLocation = 'Voisins-Le-Bretonneux, France';

  protected readonly aboutTitle = signal('À propos');
  protected readonly aboutSubTitle = signal(
    'Découvrez mon parcours, mes compétences et ma passion pour le développement web.',
  );

  protected readonly displayName = computed(() => this.defaultDisplayName);
  protected readonly location = computed(() => this.defaultLocation);
  protected readonly avatarUrl = computed(() => '/photoProfil.webp');

  protected readonly socialButtons = [
    {
      icon: 'simple-icons:linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/julien-nedellec/',
    },
    { icon: 'simple-icons:github', label: 'GitHub', href: 'https://github.com/djoudj-dev' },
    { icon: 'lucide:mail', label: 'Mail', href: 'mailto:contact@julien-nedellec.fr' },
    { icon: 'simple-icons:discord', label: 'Discord', href: 'https://discord.gg/nedellec_julien' },
    { icon: 'simple-icons:x', label: 'X', href: 'https://x.com/djoudjDev' },
  ] as const;

  protected readonly highlights: readonly Highlight[] = [
    {
      title: 'Éternel étudiantt',
      description:
        'Toujours en quête de nouvelles connaissances pour rester à la pointe du développement web.',
      icon: 'ph:student-bold',
    },
    {
      title: "Esprit d'équipe",
      description:
        'Collaboration et partage sont au cœur de ma façon de travailler pour livrer des projets ambitieux.',
      icon: 'ph:users-three',
    },
    {
      title: 'Curieux de nature',
      description:
        'Exploration permanente de nouvelles approches et solutions créatives pour les défis techniques.',
      icon: 'ph:lightbulb-filament-bold',
    },
    {
      title: 'Pensée analytique',
      description:
        'Analyse fine des problèmes complexes pour imaginer des réponses élégantes et performantes.',
      icon: 'ph:brain',
    },
  ] as const;

  protected readonly diplomas: readonly Diploma[] = [
    {
      id: 'dwwm',
      title: 'Développeur Web et Web Mobile',
      provider: 'Studi',
      shortDescription: 'Titre professionnel Bac +2 — spécialisation applications web et mobiles.',
      tooltip: {
        description:
          "Titre professionnel de niveau 5 axé sur la conception, le développement et la maintenance d'applications web et mobiles, avec une pédagogie orientée bonnes pratiques et travail en équipe.",
        skills: [
          'HTML5, CSS3, JavaScript',
          'Angular & TypeScript',
          'SQL & NoSQL',
          'Git & GitHub',
          'Responsive Design',
          'API REST',
        ],
      },
    },
    {
      id: 'pgi-erp',
      title: "Développeur d'applications PGI/ERP",
      provider: 'ALT-RH',
      shortDescription:
        'Titre professionnel Bac +2 — cycle complet de développement applicatif PGI.',
      tooltip: {
        description:
          "Titre professionnel de niveau 5 dédié à la conception et à la maintenance d'applications de gestion intégrées, avec un focus sur l'architecture logicielle et la collaboration agile.",
        skills: [
          'HTML5, CSS3, JavaScript, jQuery',
          'Java & J2EE',
          'MySQL, UML & modélisation',
          'Git & gestion de version',
          'Algorithmique & design patterns',
          'Méthodes agiles (Scrum, RUP)',
        ],
      },
    },
  ];

  protected readonly initials = computed(() => this.extractInitials(this.displayName()));

  protected readonly hasLocation = computed(() => !!this.location());
  protected readonly hasAvatar = computed(() => !!this.avatarUrl());

  private extractInitials(name: string): string {
    const pieces = name
      .split(/\s+/)
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .slice(0, 2);

    return pieces.map((segment) => segment[0]?.toUpperCase() ?? '').join('');
  }

  navigateToSkills(): void {
    this.router.navigate(['/skills']);
  }
}
