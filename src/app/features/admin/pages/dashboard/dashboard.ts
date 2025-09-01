import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text">Dashboard</h1>
        <p class="text-text/60 mt-2">Vue d'ensemble de votre portfolio</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-background overflow-hidden shadow rounded-lg border border-accent">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                  <span class="text-text text-sm font-medium">U</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-text truncate">Utilisateurs</dt>
                  <dd class="text-lg font-medium text-text">
                    {{ stats().users }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-background overflow-hidden shadow rounded-lg border border-accent">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                  <span class="text-text text-sm font-medium">P</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-text truncate">Projets</dt>
                  <dd class="text-lg font-medium text-text">
                    {{ stats().projects }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-background overflow-hidden shadow rounded-lg border border-accent">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-secondary rounded-md flex items-center justify-center">
                  <span class="text-text text-sm font-medium">V</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-text truncate">Visiteurs (30j)</dt>
                  <dd class="text-lg font-medium text-text">
                    {{ stats().visitors }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="bg-background shadow rounded-lg border border-accent mb-8">
        <div class="px-6 py-5">
          <h3 class="text-lg leading-6 font-medium text-text mb-4">Actions rapides</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
              (click)="navigateToSection('badges')"
            >
              Gérer les badges
            </button>
            <button
              class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
              (click)="navigateToSection('users')"
            >
              Gérer les utilisateurs
            </button>
            <button
              class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
              (click)="navigateToSection('projects')"
            >
              Gérer les projets
            </button>
            <button
              class="bg-secondary hover:bg-accent text-text px-4 py-2 rounded-md text-sm font-medium transition-colors w-full"
              (click)="navigateToSection('skills')"
            >
              Gérer les compétences
            </button>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="bg-background shadow rounded-lg border border-accent">
        <div class="px-6 py-5">
          <h3 class="text-lg leading-6 font-medium text-text mb-4">Activité récente</h3>
          <div class="flow-root">
            <ul role="list" class="-mb-8">
              @for (activity of recentActivity(); track activity.id) {
                <li>
                  <div class="relative pb-8">
                    @if (!$last) {
                      <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-accent" aria-hidden="true"></span>
                    }
                    <div class="relative flex space-x-3">
                      <div>
                        <span class="h-8 w-8 rounded-full bg-secondary flex items-center justify-center ring-8 ring-background">
                          <span class="text-text text-xs font-medium">{{ activity.type }}</span>
                        </span>
                      </div>
                      <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p class="text-sm text-text">
                            {{ activity.description }}
                          </p>
                        </div>
                        <div class="whitespace-nowrap text-right text-sm text-text/60">
                          {{ activity.time }}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboard {
  private readonly router = inject(Router);

  readonly stats = signal({
    users: 1,
    projects: 5,
    visitors: 124,
  });

  readonly recentActivity = signal([
    {
      id: 1,
      type: 'B',
      description: 'Nouveau badge "Angular Expert" créé',
      time: 'Il y a 2 heures',
    },
    {
      id: 2,
      type: 'P',
      description: 'Projet "Portfolio React" mis à jour',
      time: 'Il y a 5 heures',
    },
    {
      id: 3,
      type: 'U',
      description: 'Connexion administrateur',
      time: 'Il y a 1 jour',
    },
    {
      id: 4,
      type: 'S',
      description: 'Compétence "TypeScript" mise à jour',
      time: 'Il y a 2 jours',
    },
  ]);

  navigateToSection(section: string): void {
    this.router.navigate([`/admin/${section}`]);
  }
}