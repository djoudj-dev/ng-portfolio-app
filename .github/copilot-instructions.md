# 🧑‍💻 Copilot Instructions pour ng-portfolio-app

Ce guide est destiné aux agents IA pour une productivité immédiate sur ce projet Angular 20.

## 🏗️ Architecture & Structure

- **src/app/core/** : Services essentiels (auth, guards, interceptors)
- **src/app/features/** : Modules fonctionnels (about, admin, analytics, badge, contact, cv, landing, projects, skills)
- **src/app/shared/** : Composants UI et animations réutilisables
- **src/environments/** : Configurations d'environnement (API, etc.)
- **public/** : Images, icônes statiques

## 🔄 Flux de données & Intégrations

- **Backend NestJS** requis (API REST sur http://localhost:3000)
- Authentification via JWT, intercepteurs HTTP pour sécuriser les appels
- Communication inter-modules via services Angular et RxJS
- Utilisation de Tailwind CSS pour le style, animations dans `shared/animations/`

## 🛠️ Workflows Développeur

- **Démarrage local** : `pnpm start` (port 4200)
- **Tests unitaires** : `pnpm test`, `pnpm test:watch`, `pnpm test:run`
- **Lint/Format** : `pnpm lint`, `pnpm format`, `pnpm code:check`, `pnpm pre-commit`
- **Build prod** : `pnpm build`, analyse : `pnpm build:analyze`
- **Workflow complet** : `pnpm workflow:local`

## 📦 Conventions & Patterns

- **Standalone Components** : Angular 20, pas de NgModules classiques
- **Services** : Injection via constructeur, typage strict TypeScript
- **Dossier features/** : Chaque domaine métier a ses propres composants, services, interfaces et data
- **Tests** : Utilisation de Vitest, fichiers `.spec.ts` à côté du code testé
- **Routes** : Définies dans `app.routes.ts`, guards dans `core/guards/`
- **Animations** : Centralisées dans `shared/animations/`
- **UI** : Composants réutilisables dans `shared/ui/`

## ⚡ Exemples de Patterns

- Service d'authentification : `core/services/auth.ts`
- Guard admin : `core/guards/admin.ts`
- Intercepteur HTTP : `core/interceptors/auth.ts`
- Section compétences : `features/skills/skills.ts`, data dans `features/skills/data/`
- Gestion projets : `features/projects/`, CRUD via services et composants

## 🧩 Points d'attention

- Toujours vérifier la configuration dans `src/environments/`
- Respecter la structure des dossiers pour la maintenabilité
- Utiliser RxJS pour la gestion des états et des flux asynchrones
- Les composants sont typés et isolés, privilégier la composition
- Les tests doivent couvrir les services et composants critiques

## 🔗 Références

- [README.md](../../README.md) pour détails supplémentaires
- Backend : [nest-portfolio-app](https://github.com/djoudj-dev/nest-portfolio-app)

---

Merci de proposer des améliorations si des sections sont incomplètes ou peu claires !
