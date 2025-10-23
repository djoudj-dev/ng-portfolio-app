# Angular Best Practices Guide

## TypeScript

- **Strict type checking**: Toujours activer `strict: true` dans `tsconfig.json`
- **Type inference**: Laisser TypeScript inférer les types évidents plutôt que de les écrire explicitement
- **Avoid `any`**: Utiliser `unknown` quand le type est vraiment incertain, puis affiner le type

## Architecture Globale

### Components

- **Standalone first**: Tous les nouveaux composants doivent être standalone (défaut depuis Angular 14+, donc inutile d'ajouter des 'standalone: true' au components)
- **Single responsibility**: Un composant = une responsabilité unique
- **OnPush change detection**: Toujours utiliser `changeDetection: ChangeDetectionStrategy.OnPush`
- **Petits templates**: Préférer les templates inline pour les petits composants

```typescript
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button (click)="onClick.emit()">{{ label() }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  label = input<string>('Click me');
  onClick = output<void>();
}
```

### Signals & State Management

- **Local state**: Utiliser `signal()` pour la state locale des composants
- **Derived state**: Utiliser `computed()` pour les valeurs dérivées
- **Updates**: Utiliser `set()` ou `update()` au lieu de `mutate()`
- **Reactivity**: Les signals offrent une réactivité fine-grained optimisée

```typescript
import { signal, computed } from '@angular/core';

export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(c => c + 1);
  }
  
  reset() {
    this.count.set(0);
  }
}
```

### Input/Output

- **Functions over decorators**: Utiliser `input()` et `output()` au lieu de `@Input()` et `@Output()`
- **Type safety**: Les fonctions offrent une meilleure inférence de type
- **Required inputs**: Utiliser `input.required()` pour les inputs obligatoires

```typescript
export class ItemComponent {
  id = input.required<string>();
  name = input<string>();
  delete = output<string>();
}
```

## Templates

- **Native control flow**: Utiliser `@if`, `@for`, `@switch` au lieu de `*ngIf`, `*ngFor`, `*ngSwitch`
- **Property binding**: Préférer `class="..."` et `style="..."` au lieu de `[ngClass]` et `[ngStyle]`
- **Async pipe**: Utiliser le pipe `async` pour les observables et promises
- **Simple logic**: Garder les templates simples; la logique complexe va dans le composant

```html
<!-- ✅ Correct -->
<div class="card" [class.active]="isActive()">
  @if (items().length > 0) {
    @for (item of items(); track item.id) {
      <app-item [item]="item" (delete)="onDelete($event)" />
    }
  } @else {
    <p>Aucun élément</p>
  }
</div>

<!-- ❌ Éviter -->
<!--
<div [ngClass]="{ 'card': true, 'active': isActive() }">
  <div *ngIf="(items$ | async) as items">
    <div *ngFor="let item of items">
      <app-item [item]="item"></app-item>
    </div>
  </div>
</div>-->

```

## Images

- **NgOptimizedImage**: Utiliser pour toutes les images statiques (meilleur performance)
- **Limitation**: Ne fonctionne pas avec les images en base64 inline
- **Lazy loading**: NgOptimizedImage offre lazy loading natif

```typescript
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `<img ngSrc="hero.jpg" alt="Hero" width="400" height="300" priority />`
})
```

## Forms

- **Reactive forms**: Préférer les formulaires réactifs aux formulaires template-driven
- **Type safety**: Meilleure inférence de type avec `FormControl<T>`, `FormGroup<T>`
- **Validation**: Centraliser la logique de validation

```typescript
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
}
```

## Host Binding

- **Host object**: Utiliser l'objet `host` dans le décorateur `@Component` ou `@Directive`
- **Éviter les decorators**: Ne pas utiliser `@HostBinding` et `@HostListener`

```typescript
// ✅ Correct
@Component({
  selector: 'app-button',
  host: {
    '[attr.aria-pressed]': 'isPressed()',
    '(click)': 'onClick()',
    'role': 'button'
  }
})

// ❌ Éviter
@Component({})
export class OldButtonComponent {
  @HostBinding('attr.aria-pressed') isPressed = false;
  @HostListener('click') onClick() {}
}
```

## Services & Dependency Injection

- **Singleton services**: Utiliser `providedIn: 'root'` pour les services globaux
- **Inject function**: Préférer `inject()` à l'injection dans le constructeur
- **Single responsibility**: Un service = une responsabilité
- **Type safety**: Toujours typer les services

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  
  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}

// Utilisation dans un composant
export class UserListComponent {
  private api = inject(ApiService);
  users = signal<User[]>([]);
  
  constructor() {
    this.api.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }
}
```

## Routing

- **Lazy loading**: Charger les modules de features à la demande
- **Route guards**: Utiliser les guards pour protéger les routes
- **Standalone routes**: Préférer les routes standalone

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./users.component').then(m => m.UsersComponent),
      }
    ]
  }
];
```

## Performance

- **OnPush detection**: Toujours utiliser la détection de changement OnPush
- **Computed signals**: Pour les valeurs dérivées optimisées
- **Track en @for**: Utiliser `track` pour identifier les éléments en boucle
- **@defer blocks**: Charger du contenu lourd à la demande

```html
@defer (on viewport) {
  <app-heavy-component />
} @placeholder {
  <p>Chargement...</p>
}

@for (item of items(); track item.id) {
  <app-item [item]="item" />
}
```

## Testing

- **Unit tests**: Tester les composants, services et pipes en isolation
- **AAA pattern**: Arrange → Act → Assert
- **Standalone components**: Plus faciles à tester sans dépendances NgModule

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CounterComponent } from './counter.component';

describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
  });

  it('should increment count', () => {
    component.increment();
    expect(component.count()).toBe(1);
  });
});
```

## Security

- **Sanitization**: Angular sanitize les templates par défaut
- **Trusted types**: Utiliser `bypassSecurityTrustHtml()` avec prudence
- **XSS protection**: Éviter de lier des données non validées aux attributs `[innerHTML]`

## Structure du Projet

```
src/
├── app/
│   ├── core/                 # Services singleton, guards, intercepteurs
│   ├── shared/               # Composants, pipes, directives réutilisables
│   ├── features/
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── settings/
│   ├── app.routes.ts
│   └── app.component.ts
├── assets/
├── styles/
└── main.ts
```

## Checklist Déploiement

- [ ] Mode strict TypeScript activé
- [ ] Tous les composants en standalone
- [ ] OnPush change detection partout
- [ ] Pas de NgModule (sauf si legacy)
- [ ] Tests unitaires > 80% coverage
- [ ] Lazy loading configuré pour les features
- [ ] Images optimisées avec NgOptimizedImage
- [ ] Build production testé
- [ ] Lighthouse score > 90
