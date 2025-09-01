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
      <div class="p-6">
        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        } @else {
          @if (currentBadge(); as badge) {
            <!-- Badge Card -->
            <div class="bg-background shadow rounded-lg border border-accent max-w-2xl mx-auto">
              <div class="px-6 py-4 border-b border-accent flex justify-between items-center">
                <h3 class="text-lg font-medium text-text">Badge actif</h3>
                <button
                  (click)="refreshBadges()"
                  class="text-accent hover:text-accent/80 text-sm font-medium"
                >
                  🔄 Actualiser
                </button>
              </div>

              <div class="p-6">
                @if (!isEditing()) {
                  <!-- Vue normale -->
                  <div class="bg-secondary rounded-lg p-6">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-4">
                        <div
                          class="w-16 h-16 bg-accent rounded-lg flex items-center justify-center"
                        >
                          <span class="text-2xl text-white">🏷️</span>
                        </div>
                        <div>
                          <h4 class="text-xl font-semibold text-text">{{ badge.id }}</h4>
                          <div class="flex items-center space-x-2 mt-2">
                            <span
                              [class]="getStatusBadgeClass(badge.status)"
                              class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                            >
                              {{ getStatusLabel(badge.status) }}
                            </span>
                            @if (badge.availableFrom) {
                              <span class="text-sm text-text/60">
                                • {{ formatDate(badge.availableFrom) }}
                              </span>
                            }
                          </div>
                        </div>
                      </div>

                      <button
                        (click)="startEditing(badge)"
                        class="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Composant d'édition -->
                  <app-badge-edit
                    [badgeId]="badge.id"
                    (save)="onBadgeSaved($event)"
                    (cancelled)="cancelEditing()"
                  />
                }
              </div>
            </div>
          } @else {
            <div class="text-center py-12">
              <div class="mx-auto h-12 w-12 text-text/40">
                <span class="text-4xl">🏷️</span>
              </div>
              <h3 class="mt-2 text-sm font-medium text-text">Aucun badge configuré</h3>
            </div>
          }
        }
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
