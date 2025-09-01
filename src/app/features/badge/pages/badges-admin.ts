import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BadgeService } from '../services/badge-service';
import { BadgeStatus } from '../models/badge.model';

@Component({
  selector: 'app-badges-admin',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text">Badge actuel</h1>
        <p class="text-text/60 mt-2">Aperçu et gestion de votre badge de compétences</p>
      </div>

      <!-- Badge Actuel -->
      <div class="bg-background shadow rounded-lg border border-accent">
        <div class="px-6 py-4 border-b border-accent flex justify-between items-center">
          <h3 class="text-lg font-medium text-text">Badge principal</h3>
          <button
            (click)="refreshBadges()"
            class="text-accent hover:text-accent/80 text-sm font-medium"
          >
            🔄 Actualiser
          </button>
        </div>

        @if (isLoading()) {
          <div class="px-6 py-12 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p class="text-text/60 mt-2">Chargement...</p>
          </div>
        } @else {
          @if (currentBadge(); as badge) {
            <div class="p-6">
              <!-- Aperçu du badge -->
              <div class="bg-secondary rounded-lg p-6 mb-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-accent rounded-lg flex items-center justify-center">
                      <span class="text-2xl text-white">🏷️</span>
                    </div>
                    <div>
                      <h4 class="text-xl font-semibold text-text">Badge ID: {{ badge.id }}</h4>
                      <div class="flex items-center space-x-2 mt-2">
                        <span
                          [class]="getStatusBadgeClass(badge.status)"
                          class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                        >
                          {{ getStatusLabel(badge.status) }}
                        </span>
                        @if (badge.availableFrom) {
                          <span class="text-sm text-text/60">
                            • Programmé pour le {{ formatDate(badge.availableFrom) }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <button
                    (click)="editBadge(badge.id)"
                    class="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Modifier le statut
                  </button>
                </div>
              </div>

              <!-- Détails -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="text-sm font-medium text-text/60 mb-2">Date de création</h5>
                  <p class="text-text">{{ formatDate(badge.createdAt) }}</p>
                </div>
                <div>
                  <h5 class="text-sm font-medium text-text/60 mb-2">Dernière modification</h5>
                  <p class="text-text">{{ formatDate(badge.updatedAt) }}</p>
                </div>
              </div>

              @if (badge.status === badgeStatus.AVAILABLE_FROM && badge.availableFrom) {
                <div class="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div class="flex items-center space-x-2">
                    <span class="text-orange-600">⏰</span>
                    <span class="text-sm font-medium text-orange-800">
                      Ce badge sera disponible le {{ formatDateFull(badge.availableFrom) }}
                    </span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="px-6 py-12 text-center">
              <div class="mx-auto h-12 w-12 text-text/40">
                <span class="text-4xl">🏷️</span>
              </div>
              <h3 class="mt-2 text-sm font-medium text-text">Aucun badge</h3>
              <p class="mt-1 text-sm text-text/60">Aucun badge n'est actuellement configuré.</p>
            </div>
          }
        }
      </div>

      @if (error()) {
        <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-600">{{ error() }}</p>
          <button
            (click)="error.set(null)"
            class="mt-2 text-sm text-red-500 hover:text-red-400 underline"
          >
            Fermer
          </button>
        </div>
      }
    </div>
  `,
})
export class BadgesAdmin implements OnInit {
  private readonly router = inject(Router);
  private readonly badgeService = inject(BadgeService);

  readonly badges = this.badgeService.badgeList;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly activeBadgesCount = computed(
    () => this.badges().filter((badge) => badge.status === BadgeStatus.AVAILABLE).length,
  );

  readonly unavailableBadgesCount = computed(
    () => this.badges().filter((badge) => badge.status === BadgeStatus.UNAVAILABLE).length,
  );

  readonly scheduledBadgesCount = computed(
    () => this.badges().filter((badge) => badge.status === BadgeStatus.AVAILABLE_FROM).length,
  );

  readonly currentBadge = computed(() => {
    const badges = this.badges();
    return badges.length > 0 ? badges[0] : null;
  });

  readonly badgeStatus = BadgeStatus;

  ngOnInit(): void {
    this.refreshBadges();
  }

  refreshBadges(): void {
    this.isLoading.set(true);
    this.error.set(null);

    console.log('Actualisation des badges...');
    this.badgeService.loadBadges();

    // Simuler un petit délai pour voir le loading
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  editBadge(id: string): void {
    console.log('Édition du badge:', id);
    this.router.navigate(['/admin/badges/edit', id]);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDateFull(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatusLabel(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'Disponible';
      case BadgeStatus.UNAVAILABLE:
        return 'Indisponible';
      case BadgeStatus.AVAILABLE_FROM:
        return 'Programmé';
      default:
        return 'Inconnu';
    }
  }

  getStatusBadgeClass(status: BadgeStatus): string {
    switch (status) {
      case BadgeStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case BadgeStatus.UNAVAILABLE:
        return 'bg-red-100 text-red-800';
      case BadgeStatus.AVAILABLE_FROM:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}