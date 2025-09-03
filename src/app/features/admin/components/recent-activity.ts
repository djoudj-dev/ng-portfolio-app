import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { type Activity, ActivityType } from '@features/admin/interfaces/activity.interface';
import { ActivityService } from '@features/admin/services/activity.service';

@Component({
  selector: 'app-recent-activity',
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span class="text-lg">📈</span>
          </div>
          <h2 class="text-xl font-semibold text-text">Activité récente</h2>
        </div>
        <button
          class="text-sm text-accent hover:text-accent/80 font-medium transition-colors duration-200"
        >
          Voir tout
        </button>
      </div>

      <div class="space-y-4">
        @for (activity of recentActivity(); track activity.id) {
          <article
            class="flex items-start gap-4 p-4 rounded-xl border border-accent hover:border-accent/20 hover:bg-accent/5 transition-all duration-200 group"
          >
            <div class="flex-shrink-0 pt-1">
              <div class="relative">
                <div
                  class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center border border-accent/30 group-hover:scale-110 transition-transform duration-200"
                >
                  <span class="text-sm font-bold text-text">{{
                    getActivityTypeLabel(activity.type)
                  }}</span>
                </div>
                @if (!$last) {
                  <div
                    class="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-accent/20"
                  ></div>
                }
              </div>
            </div>

            <div class="flex-1 min-w-0 space-y-1">
              <p
                class="text-sm font-medium text-text leading-relaxed group-hover:text-primary transition-colors duration-200"
              >
                {{ activity.description }}
              </p>
              <div class="flex items-center gap-2">
                <time
                  class="text-xs text-secondary font-medium bg-accent/10 px-2 py-1 rounded-full"
                >
                  {{ formatTimeAgo(activity.timestamp) }}
                </time>
                <div class="w-1 h-1 bg-accent/40 rounded-full"></div>
                <span class="text-xs text-secondary">Automatique</span>
              </div>
            </div>
          </article>
        } @empty {
          <div class="text-center py-12">
            <div
              class="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl opacity-60">📊</span>
            </div>
            <p class="text-secondary">Aucune activité récente disponible</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class RecentActivityComponent {
  private readonly activityService = inject(ActivityService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly recentActivity = signal<Activity[]>([]);

  private async loadRecentActivities(): Promise<void> {
    try {
      const activities = await this.activityService.getRecentActivities(5);
      this.recentActivity.set(activities);

      // Forcer la détection de changement pour OnPush
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Dashboard: Erreur lors du chargement des activités:', error);
      this.recentActivity.set([]);
      this.cdr.markForCheck();
    }
  }

  constructor() {
    // Charger les activités immédiatement
    this.loadRecentActivities();

    // Recharger toutes les 2 minutes
    setInterval(() => {
      this.loadRecentActivities();
    }, 120000);
  }

  getActivityTypeLabel(type: ActivityType): string {
    return this.activityService.getActivityTypeLabel(type);
  }

  formatTimeAgo(date: Date): string {
    return this.activityService.formatTimeAgo(date);
  }
}
