import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeAdminLayout } from '../components/badge-admin-layout';
import { BadgeEditComponent } from '../components/badge-edit';
import { BadgeService } from '../services/badge-service';
import { BadgeStatus, Badge } from '../models/badge.model';
import { BadgeUtils } from '../utils/badge-utils';
import { ToastService } from '@shared/ui/toast/service/toast-service';

@Component({
  selector: 'app-badges-admin',
  imports: [CommonModule, BadgeAdminLayout, BadgeEditComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-badge-admin-layout [pageTitle]="'Modification du badge'" [showBackButton]="false">
      <div class="max-w-6xl mx-auto p-6 space-y-8">
        <header
          class="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-accent/20 shadow-sm"
        >
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span class="text-2xl">🏷️</span>
                </div>
                <h1 class="text-3xl font-bold text-text">Gestion du Badge</h1>
              </div>
              <p class="text-secondary text-base max-w-2xl">
                Configurez et modifiez le statut de disponibilité de votre profil
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              @if (currentBadge(); as badge) {
                <div
                  class="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-accent/30 shadow-sm"
                >
                  <div class="flex items-center gap-2">
                    <div
                      [class]="
                        badge.status === 'AVAILABLE'
                          ? 'w-2 h-2 bg-green-500 rounded-full'
                          : badge.status === 'UNAVAILABLE'
                            ? 'w-2 h-2 bg-red-500 rounded-full'
                            : 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse'
                      "
                    ></div>
                    <span class="text-sm font-medium text-text">
                      {{ getStatusLabel(badge.status) }}
                    </span>
                  </div>
                </div>
              }

              <button
                (click)="refreshBadges()"
                class="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>
        </header>

        <main class="space-y-6">
          @if (isLoading()) {
            <div class="flex items-center justify-center py-24 text-text">
              <div class="text-center space-y-4">
                <div
                  class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"
                ></div>
                <p class="text-secondary font-medium">Chargement du badge...</p>
              </div>
            </div>
          } @else {
            @if (currentBadge(); as badge) {
              <article
                class="bg-background rounded-2xl border border-accent/20 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden max-w-4xl mx-auto"
              >
                @if (!isEditing()) {
                  <div class="p-6">
                    <div class="space-y-6">
                      <div class="flex items-start justify-between gap-4">
                        <div class="flex items-start gap-4">
                          <div
                            class="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-accent/30"
                          >
                            <span class="text-3xl">🏷️</span>
                          </div>
                          <div class="space-y-2">
                            <h2 class="text-2xl font-bold text-text">Badge de Disponibilité</h2>
                            <p class="text-secondary">
                              ID:
                              <code class="bg-accent/10 px-2 py-1 rounded font-mono text-sm">{{
                                badge.id
                              }}</code>
                            </p>
                          </div>
                        </div>
                        <button
                          (click)="startEditing(badge)"
                          class="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                        >
                          ✏️ Modifier
                        </button>
                      </div>

                      <div
                        class="bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl p-6 border border-accent/20"
                      >
                        <div class="space-y-4">
                          <h3 class="text-lg font-semibold text-text">Statut Actuel</h3>
                          <div class="flex flex-wrap items-center gap-4">
                            <span
                              [class]="getStatusBadgeClass(badge.status)"
                              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full"
                            >
                              <div
                                [class]="
                                  badge.status === 'AVAILABLE'
                                    ? 'w-2 h-2 bg-green-500 rounded-full'
                                    : badge.status === 'UNAVAILABLE'
                                      ? 'w-2 h-2 bg-red-500 rounded-full'
                                      : 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse'
                                "
                              ></div>
                              {{ getStatusLabel(badge.status) }}
                            </span>
                            @if (badge.availableFrom) {
                              <div
                                class="flex items-center gap-2 text-sm text-secondary bg-background/60 px-3 py-2 rounded-lg border border-accent/20"
                              >
                                📅 Disponible à partir du {{ formatDate(badge.availableFrom) }}
                              </div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="pt-4 border-t border-accent/20">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-secondary">
                          <div class="flex items-center gap-2">
                            <span class="font-medium">Créé le:</span>
                            <span>{{ formatDateFull(badge.createdAt) }}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="font-medium">Modifié le:</span>
                            <span>{{ formatDateFull(badge.updatedAt) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="p-6">
                    <div class="space-y-4">
                      <div class="flex items-center gap-3 pb-4 border-b border-accent/20">
                        <div
                          class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center"
                        >
                          ✏️
                        </div>
                        <h3 class="text-xl font-semibold text-text">Modification du Badge</h3>
                      </div>

                      <app-badge-edit
                        [badgeId]="badge.id"
                        (save)="onBadgeSaved($event)"
                        (cancelled)="cancelEditing()"
                      />
                    </div>
                  </div>
                }
              </article>
            } @else {
              <div class="text-center py-24">
                <div
                  class="bg-background rounded-2xl border border-accent/20 p-12 max-w-md mx-auto"
                >
                  <div
                    class="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <span class="text-4xl opacity-60">🏷️</span>
                  </div>
                  <h3 class="text-xl font-semibold text-text mb-2">Aucun badge configuré</h3>
                  <p class="text-secondary">
                    Le badge de disponibilité sera créé automatiquement lors de la première
                    configuration.
                  </p>
                </div>
              </div>
            }
          }
        </main>
      </div>
    </app-badge-admin-layout>
  `,
})
export class BadgesAdmin implements OnInit {
  private readonly badgeService = inject(BadgeService);
  private readonly toastService = inject(ToastService);

  readonly badges = this.badgeService.badgeList;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isEditing = signal(false);

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
    this.badgeService.loadBadges();
    setTimeout(() => this.isLoading.set(false), 500);
  }

  startEditing(_badge: Badge): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  onBadgeSaved(_badge: Badge): void {
    this.toastService.success('Badge mis à jour', 'Le statut a été modifié avec succès');
    this.isEditing.set(false);
    this.badgeService.loadBadges();
  }

  formatDate(date: Date): string {
    return BadgeUtils.formatDate(date);
  }

  formatDateFull(date: Date): string {
    return BadgeUtils.formatDateFull(date);
  }

  getStatusLabel(status: BadgeStatus): string {
    return BadgeUtils.getStatusLabel(status);
  }

  getStatusBadgeClass(status: BadgeStatus): string {
    return BadgeUtils.getStatusBadgeClass(status);
  }
}
