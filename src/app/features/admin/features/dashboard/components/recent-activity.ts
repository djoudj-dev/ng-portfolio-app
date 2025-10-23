import { ChangeDetectionStrategy, Component, inject, signal, DestroyRef } from '@angular/core';
import {
  type Activity,
  ActivityType,
} from '@features/admin';
import { ActivityService } from '@features/admin';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-recent-activity',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-accent shadow-lg shadow-primary/20">
          <app-svg-icon name="ph:activity" class="w-6 h-6 text-text" width="24" height="24" />
        </div>
        <h2 class="text-xl font-bold text-text">Activité récente</h2>
      </div>

      <div class="space-y-4">
        @for (activity of recentActivity(); track activity.id) {
          <div class="group">
            <article
              class="flex items-start gap-4 p-5 bg-background/60 backdrop-blur-sm border border-accent rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
            >
              <div class="flex-shrink-0 pt-1">
                <div class="relative">
                  <div
                    class="w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300 border border-accent shadow-sm"
                  >
                    <span class="text-sm font-bold text-text">{{
                      getActivityTypeLabel(activity.type)
                    }}</span>
                  </div>
                  @if (!$last) {
                    <div
                      class="absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-accent/30"
                    ></div>
                  }
                </div>
              </div>

              <div class="flex-1 min-w-0 space-y-2">
                <p
                  class="text-sm font-medium text-text leading-relaxed"
                >
                  {{ activity.description }}
                </p>
                <div class="flex items-center gap-2">
                  <time
                    class="text-xs text-secondary font-semibold bg-accent/10 px-3 py-1 rounded-full border border-accent/30 backdrop-blur-sm"
                  >
                    {{ formatTimeAgo(activity.timestamp) }}
                  </time>
                  <div class="w-1 h-1 bg-accent/60 rounded-full"></div>
                  <span class="text-xs text-secondary font-medium">Automatique</span>
                </div>
              </div>
            </article>
          </div>
        } @empty {
          <div class="text-center py-12">
            <div
              class="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-accent"
            >
              <span class="text-2xl opacity-60">📊</span>
            </div>
            <p class="text-secondary font-medium">Aucune activité récente disponible</p>
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
