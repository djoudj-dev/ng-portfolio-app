import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import {
  type Activity,
  ActivityType,
} from '@features/admin/core/interfaces/activity.interface';
import { ActivityService } from '@features/admin/core/services/activity-service';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-recent-activity',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span class="text-lg">
              <app-svg-icon name="ph:activity" class="w-6 h-6 text-primary" width="24" height="24" />
            </span>
          </div>
          <h2 class="text-xl font-semibold text-text">Activité récente</h2>
        </div>
      </div>

      <div class="space-y-4">
        @for (activity of recentActivity(); track activity.id) {
          <div class="group">
            <article
              class="flex items-start gap-4 p-6 bg-background border border-accent rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex-shrink-0 pt-1">
                <div class="relative">
                  <div
                    class="w-12 h-12 rounded-full bg-accent/40 flex items-center justify-center group-hover:bg-accent transition-colors duration-300 border border-accent/30"
                  >
                    <span class="text-sm font-bold text-text">{{
                      getActivityTypeLabel(activity.type)
                    }}</span>
                  </div>
                  @if (!$last) {
                    <div
                      class="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-accent/20"
                    ></div>
                  }
                </div>
              </div>

              <div class="flex-1 min-w-0 space-y-2">
                <p
                  class="text-sm font-medium text-text leading-relaxed group-hover:text-accent transition-colors duration-300"
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
          </div>
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
  private readonly destroyRef = inject(DestroyRef);

  readonly recentActivity = signal<Activity[]>([]);

  constructor() {
    // Chargement initial
    void this.loadRecentActivities();

    // Auto-refresh toutes les 2 minutes avec cleanup automatique
    const refreshInterval = setInterval(() => {
      void this.loadRecentActivities();
    }, 120000);

    // Cleanup automatique via DestroyRef
    this.destroyRef.onDestroy(() => {
      clearInterval(refreshInterval);
    });
  }

  private async loadRecentActivities(): Promise<void> {
    try {
      const activities = await this.activityService.getRecentActivities(5);
      this.recentActivity.set(activities);
    } catch (error) {
      console.error('❌ Dashboard: Erreur lors du chargement des activités:', error);
      this.recentActivity.set([]);
    }
  }

  getActivityTypeLabel(type: ActivityType): string {
    return this.activityService.getActivityTypeLabel(type);
  }

  formatTimeAgo(date: Date): string {
    return this.activityService.formatTimeAgo(date);
  }
}
