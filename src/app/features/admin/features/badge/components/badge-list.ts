import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge, BadgeStatus } from '@features/admin';
import { BadgeService } from '@features/admin';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-badge-list',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background py-8 pt-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-background shadow-lg rounded-lg p-6 border border-accent">
          <!-- Header -->
          <div class="mb-6 flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-text">Gestion des badges</h1>
              <p class="text-secondary mt-2">Gérez la disponibilité de vos badges professionnels</p>
            </div>
            @if (isAdmin()) {
              <button
                (click)="onCreateBadge()"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Créer un badge
              </button>
            }
          </div>

          @if (isLoading()) {
            <div class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"
              ></div>
              <p class="text-secondary mt-2">Chargement...</p>
            </div>
          } @else if (error()) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p class="text-red-600">{{ error() }}</p>
              <button
                (click)="loadBadges()"
                class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          } @else {
            @if (badges().length === 0) {
              <div class="text-center py-8">
                <p class="text-secondary">Aucun badge trouvé</p>
                @if (isAdmin()) {
                  <button
                    (click)="onCreateBadge()"
                    class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80"
                  >
                    Créer le premier badge
                  </button>
                }
              </div>
            } @else {
              <div class="space-y-4">
                @for (badge of badges(); track badge.id) {
                  <div
                    class="bg-surface border border-accent rounded-lg p-4 flex items-center justify-between"
                  >
                    <div class="flex items-center space-x-4">
                      <!-- Status Badge -->
                      <div
                        class="px-3 py-1 rounded-full text-sm font-medium"
                        [ngClass]="getStatusClasses(badge.status)"
                      >
                        {{ getStatusLabel(badge.status) }}
                      </div>

                      <div>
                        <p class="font-medium text-text">Badge #{{ badge.id.slice(0, 8) }}</p>
                        <p class="text-sm text-secondary">
                          Créé le {{ formatDate(badge.createdAt) }}
                        </p>
                        @if (badge.availableFrom && badge.status === badgeStatus.UNAVAILABLE) {
                          <p class="text-sm text-secondary">
                            Disponible à partir du {{ formatDate(badge.availableFrom) }}
                          </p>
                        }
                      </div>
                    </div>

                    <!-- Actions -->
                    @if (isAdmin()) {
                      <div class="flex space-x-2">
                        <button
                          (click)="onEditBadge(badge)"
                          class="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80"
                        >
                          Modifier
                        </button>
                        <button
                          (click)="onDeleteBadge(badge)"
                          class="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class BadgeListComponent implements OnInit {
  private readonly badgeService = inject(BadgeService);
  private readonly authService = inject(AuthService);

  readonly badges = signal<Badge[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly badgeStatus = BadgeStatus;

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.badgeService.findAll().subscribe({
      next: (badges) => {
        this.badges.set(badges);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  onCreateBadge(): void {
  }

  onEditBadge(_badge: Badge): void {
  }

  onDeleteBadge(badge: Badge): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }

    this.badgeService.delete(badge.id).subscribe({
      next: () => {
        this.loadBadges();
      },
      error: (error) => {
        this.error.set(error.message);
      },
    });
  }

  getStatusLabel(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'Disponible';
      case BadgeStatus.UNAVAILABLE:
        return 'Indisponible';
      default:
        return 'Inconnu';
    }
  }

  getStatusClasses(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
