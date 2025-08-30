# Guide de Style et Bonnes Pratiques (Synchronisé depuis .claude/CLAUDE.md)

Ce document est la référence pour le développement de `ng-portfolio-app`. Il consolide et francise les consignes de `.claude/CLAUDE.md`, afin d'assurer une source unique pour Junie.

---

## Commandes de Développement (PNPM)

- Démarrer le serveur: `pnpm start` ou `ng serve` (http://localhost:4200/)
- Build production: `pnpm run build`
- Build en watch: `pnpm run watch`
- Tests unitaires: `pnpm run test` ou `vitest`
  - Vitest avec support Angular via `@analogjs/vitest-angular`
  - Les tests suivent le pattern `*.spec.ts`
  - Setup tests: `src/test-setup.ts`
- Qualité de code:
  - Lint: `pnpm lint`
  - Lint + fix: `pnpm lint:fix`
  - Prettier (format): `pnpm prettier`
  - Vérifier formatage: `pnpm prettier:check`
  - Format + ESLint fix: `pnpm format`

IMPORTANT: Exécutez `pnpm lint` avant chaque commit.

---

## Architecture du Projet

- Framework: Angular 20.1.0 (CLI)
- Build/dev server: Vite (`@analogjs/vite-plugin-angular`)
- Tests: Vitest (remplace Karma/Jasmine)
- Style: TailwindCSS 4.1.11
- TypeScript: configuration stricte

### Intégration Backend
- NestJS pour authentification, base de données et stockage
- Configuration par environnement dans `src/environments/`
- Service d'authentification configuré dans `src/app/core/services/auth-service.ts`

### Structure Applicative
- Core (`src/app/core/`) :
  - Guards: auth, admin
  - Services: auth, thème, scroll, intégration NestJS
- Features (`src/app/features/`) :
  - Landing: Hero, badges (CRUD)
  - About: sections d’info, cartes réutilisables
  - Projects: gestion projets (recherche, pagination, filtres)
  - Skills: compétences et certifications
  - Contact: formulaire, templates e-mail, statuts
  - Admin: dashboard, édition du CV
- Shared (`src/app/shared/ui/`) :
  - Button, Navbar, Footer, Login, Toast, etc.

### Routage
- Routes chargées paresseusement avec `loadComponent`
- Routes admin protégées par `adminGuard`
- Alias de chemin: `@core`, `@features`, `@shared`, `@environments`

### Style
- TailwindCSS avec configuration personnalisée
- PostCSS pour le traitement CSS
- Styles à portée de composant si nécessaire (ex: navbar, custom-multi-select)

### Environnements
- Fichiers séparés dev/prod
- Variables d’environnement pour Supabase

---

## Guide de Style et Bonnes Pratiques Angular

Ce chapitre suit l'approche « moderne-first » d’Angular 20+.

### Philosophie Fondamentale
1. **Architecture Standalone** : Tous les composants, directives et pipes sont `standalone`. Les `NgModules` ne sont plus utilisés pour organiser le code.
2. **Réactivité via Signaux** : Les signaux sont l’outil principal pour l’état (local et partagé via services).
3. **Templates Déclaratifs** : Utiliser exclusivement le nouveau flux de contrôle (`@if`, `@for`, `@switch`).
4. **DI Moderne** : Utiliser `inject()` exclusivement; éviter l’injection par constructeur.

### Conventions de Nommage (Spécifiques au Projet)
- **Composants** : `nom-du-composant.ts` (ex: `hero-section.ts`)
- **Services** : `nom-du-service.ts` (ex: `project-service.ts`) — conserver le suffixe `-service`
- **Interfaces et Types** : `nom-du-modele.ts` (ex: `project-data.ts`)
- **Gardes** : `nom-du-garde.ts` (ex: `admin-guard.ts`)

### Bonnes Pratiques TypeScript
- **Mode Strict** : doit être respecté
- **Inférence** : laisser TS inférer quand c’est évident
- **Pas de `any`** : utiliser `unknown` si le type est indéterminé

### Composants
- **Responsabilité Unique** : petits et ciblés
- **Standalone par défaut** : ne pas ajouter `standalone: true` (la CLI gère)
- **Détection de changement** : toujours `changeDetection: ChangeDetectionStrategy.OnPush`
- **Inputs & Outputs** : utiliser `input()` et `output()`, jamais les décorateurs
  ```typescript
  import { Component, Input, Output, EventEmitter, input, output } from '@angular/core';

  // Bien
  @Component({ selector: 'demo-ok', template: '' })
  export class DemoOkComponent {
    name = input.required<string>();
    nameChange = output<string>();
  }

  // Mauvais
  @Component({ selector: 'demo-bad', template: '' })
  export class DemoBadComponent {
    @Input() name: string = '';
    @Output() nameChange = new EventEmitter<string>();
  }
  ```
- **Bindings de l’Hôte** : utiliser `host` dans `@Component`, pas `@HostBinding`/`@HostListener`
- **Styles** : éviter `[ngClass]` / `[ngStyle]`; préférer les bindings natifs
  ```html
  <div [class.active]="isActive()" [style.color]="color()"></div>
  ```
- **Images** : utiliser `NgOptimizedImage` pour les images statiques

### Gestion de l’État
- **Signaux** pour tout l’état local/partagé
- **État dérivé** via `computed()`
- **Immutabilité** : `set()` / `update()`, jamais `mutate()`

### Templates
- **Flux de Contrôle Natif** : `@if`, `@for`, `@switch` (interdiction de `*ngIf`, `*ngFor`)
- **Boucles** : toujours fournir `track` pour `@for`
- **Pipes** : importer dans `imports` du composant

### Services et Injection de Dépendances
- **Responsabilité Unique** par service
- **Injection via `inject()`** uniquement
  ```typescript
  // Bien
  export class MyComponent {
    private readonly projectService = inject(ProjectService);
  }

  // Mauvais
  export class MyComponent {
    constructor(private readonly projectService: ProjectService) {}
  }
  ```
- **Singletons** : `providedIn: 'root'` pour les services globaux

### Routage
- **Lazy Loading** systématique via `loadComponent`

---

## Qualité du Code
1. **Linting** : le code doit passer ESLint sans erreur — exécuter `pnpm lint` avant de committer
2. **Formatage** : formater avec Prettier — `pnpm format` pour appliquer automatiquement

---

Notes de Développement
- Système de thème (mode sombre) via service dédié
- Système de notifications (Toast) avec service et modèles
- Templates d’e-mails sous `/templates/`
- Séparation des données statiques sous `/data/`
- Interfaces TypeScript sous `/interface/`
