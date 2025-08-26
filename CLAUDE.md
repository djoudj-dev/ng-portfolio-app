# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `pnpm start` - Start development server (runs `ng serve`)
- `pnpm build` - Build for production
- `pnpm watch` - Build in watch mode for development
- `pnpm test` - Run unit tests with Vitest
- `pnpm lint` - Lint TypeScript, JavaScript, and HTML files
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier and fix linting issues
- `pnpm prettier` - Format code with Prettier
- `pnpm prettier:check` - Check code formatting

### Testing
- Uses Vitest instead of Karma/Jasmine for unit tests
- Test files follow `*.spec.ts` pattern
- Test configuration in `vite.config.mts`
- Run specific test: `pnpm test -- [pattern]`

## Architecture Overview

### Technology Stack
- **Framework**: Angular 20.1+ with standalone components (no NgModules)
- **Build Tool**: Vite via @analogjs/vite-plugin-angular
- **Styling**: Tailwind CSS 4.1+
- **Testing**: Vitest with Angular support
- **Backend**: Supabase (PostgreSQL database + Auth)
- **State Management**: RxJS with services
- **Linting**: ESLint with Angular-specific rules
- **Formatting**: Prettier with Angular HTML parser

### Project Structure

#### Core Architecture (`src/app/`)
- **core/**: Singleton services, guards, and app-wide utilities
  - **guards/**: Route guards (access-guard.ts)
  - **services/**: Core services (Supabase, security, theme, rate limiting)
- **features/**: Feature modules organized by business domain
- **shared/**: Reusable components, behaviors, and utilities

#### Feature Organization
Each feature follows a consistent structure:
```
features/[feature-name]/
├── components/          # Feature-specific components
├── data/               # Static data and constants
├── interface/          # TypeScript interfaces
├── services/           # Feature-specific services
├── [feature-name].ts   # Main feature component
└── [feature-name].html # Feature template (if needed)
```

#### Key Features
- **about/**: Personal information, skills, objectives
- **admin/**: Administrative dashboard with CV management
- **contact/**: Contact form with email templates
- **landing/**: Hero section and badge system
- **projects/**: Project showcase with filtering and pagination
- **skills/**: Technical skills and certifications

### Key Architectural Patterns

#### Standalone Components
- All components use Angular standalone APIs (no NgModules)
- Import dependencies directly in component decorators
- App configuration in `app.config.ts`

#### Supabase Integration
- Client configured in `core/services/supabase-client.ts`
- Per-tab storage keys to avoid cross-tab conflicts
- Authentication and data persistence handled via Supabase

#### Security & Performance
- Rate limiting service for API calls
- Security service for input validation
- Audit service for tracking user actions
- Route guards for admin access control

#### Styling Approach
- Tailwind CSS utility-first approach
- Custom CSS only when necessary (e.g., custom-multi-select.css)
- Dark mode support via theme service

### Configuration Files
- **angular.json**: Angular CLI configuration with Vite builder
- **vite.config.mts**: Vite configuration for dev server and testing
- **tsconfig.json**: TypeScript configuration with path mapping
- **eslint.config.mjs**: ESLint configuration with Angular rules

### Environment Setup
- Environment variables in `src/environments/`
- Supabase credentials configured per environment
- Development vs production builds handled via Angular configuration

### Common Development Patterns
- Services use dependency injection with `inject()` function
- Components follow reactive programming patterns with RxJS
- Error handling through global error listeners and toast notifications
- Form validation using Angular reactive forms
- Custom behaviors for UI interactions (click-outside, hover-class)