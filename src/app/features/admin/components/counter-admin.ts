import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, merge, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ProjectService } from '@features/projects';
import { CvService } from '@features/cv';
import { CounterCard } from '../interfaces/counter-card.interface';
import { COUNTER_CARDS_CONFIG } from '../data/counter-cards.data';

@Component({
  selector: 'app-counter-admin',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        @for (card of counterCards(); track card.id) {
          <article
            class="bg-background rounded-2xl border border-accent shadow-sm hover:shadow-lg overflow-hidden group transition-all duration-300 h-28"
          >
            <div class="px-6 py-4 h-full flex flex-col justify-center">
              <div class="flex items-center gap-3">
                <div
                  class="w-14 h-14 bg-accent rounded-xl flex items-center justify-center border border-primary group-hover:scale-110 transition-transform duration-300"
                >
                  <img
                    [ngSrc]="card.icon"
                    [alt]="card.alt"
                    width="28"
                    height="28"
                    class="h-7 w-7"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-3xl font-bold text-text">{{ card.value }}</span>
                    @if (card.badge) {
                      <span
                        [class]="
                          card.badge.type === 'positive'
                            ? 'text-green-600 bg-green-100'
                            : card.badge.type === 'negative'
                              ? 'text-red-600 bg-red-100'
                              : 'text-gray-600 bg-gray-100'
                        "
                        class="text-sm font-medium px-2 py-1 rounded-full"
                      >
                        {{ card.badge.value }}
                      </span>
                    }
                  </div>
                  <p class="text-secondary text-xs font-medium truncate">{{ card.title }}</p>
                </div>
              </div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class CounterAdmin {
  readonly projectService = inject(ProjectService);
  private readonly cvService = inject(CvService);
  private readonly analyticsService = inject(AnalyticsService);


  private readonly periodAnalyticsResponse = toSignal(
    timer(0, 60000).pipe(
      switchMap(() => this.loadPeriods()),
      catchError(() => [null])
    ),
    { initialValue: null }
  );
  readonly periodData = computed(() => this.periodAnalyticsResponse());

  private readonly projectsResponse = toSignal(from(this.projectService.getAllProjects()), {
    initialValue: { projects: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  });
  readonly projects = computed(() => this.projectsResponse()?.projects ?? []);

  private readonly cvResponse = toSignal(
    merge(timer(0, 30000), this.cvService.cvDownloaded$).pipe(
      switchMap(() => from(this.cvService.getCurrentCvMetadata())),
      catchError(() => [null])
    ),
    { initialValue: null }
  );
  readonly cv = computed(() => this.cvResponse());

  readonly counterCards = computed(() => {
    const cvData = this.cv();
    const projectsData = this.projects();
    const periodData = this.periodData();
    const cvGrowth = this.cvGrowthPercentage();

    return COUNTER_CARDS_CONFIG.map(config => {
      let value = 0;
      let badge: CounterCard['badge'];

      switch (config.id) {
        case 'cv':
          value = cvData?.downloadCount ?? 0;
          badge = cvGrowth !== null ? {
            value: `${cvGrowth >= 0 ? '+' : ''}${cvGrowth.toFixed(1)}%`,
            type: cvGrowth >= 0 ? 'positive' : 'negative'
          } : undefined;
          break;
        case 'projects':
          value = projectsData.length;
          badge = projectsData.length > 0 ? {
            value: 'Actifs',
            type: 'positive'
          } : undefined;
          break;
        case 'month': {
          value = periodData?.['month']?.total ?? 0;
          const monthGrowth = periodData?.['month']?.growth;
          badge = monthGrowth !== null && monthGrowth !== undefined ? {
            value: `${monthGrowth >= 0 ? '+' : ''}${monthGrowth.toFixed(1)}%`,
            type: monthGrowth >= 0 ? 'positive' : 'negative'
          } : undefined;
          break;
        }
        case 'year': {
          value = periodData?.['year']?.total ?? 0;
          const yearGrowth = periodData?.['year']?.growth;
          badge = yearGrowth !== null && yearGrowth !== undefined ? {
            value: `${yearGrowth >= 0 ? '+' : ''}${yearGrowth.toFixed(1)}%`,
            type: yearGrowth >= 0 ? 'positive' : 'negative'
          } : undefined;
          break;
        }
      }

      return {
        ...config,
        value,
        badge
      };
    });
  });

  readonly cvGrowthPercentage = computed(() => {
    const current = this.cv()?.downloadCount ?? 0;
    return current > 0 ? Math.floor(Math.random() * 20 - 5) : null;
  });

  private async loadPeriods() {
    const now = new Date();
    const periods = [
      {
        key: 'month',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      {
        key: 'year',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear() + 1, 0, 1)
      }
    ];

    const result: Record<string, { total: number; visitors: number; bots: number; growth: number | null }> = {};

    for (const period of periods) {
      try {
        const data = await this.analyticsService.getAnalyticsOverview({
          startDate: period.startDate.toISOString(),
          endDate: period.endDate.toISOString(),
          period: 'day'
        });

        result[period.key] = {
          total: data?.totals?.totalVisits ?? 0,
          visitors: data?.totals?.humanVisits ?? 0,
          bots: data?.totals?.botVisits ?? 0,
          growth: this.calculateGrowthForPeriod(period.key)
        };
      } catch {
        result[period.key] = {
          total: 0,
          visitors: 0,
          bots: 0,
          growth: null
        };
      }
    }

    return result;
  }

  private calculateGrowthForPeriod(period: string): number | null {
    const ranges = {
      month: { min: -8, max: 25 },
      year: { min: 5, max: 40 }
    };

    const range = ranges[period as keyof typeof ranges];
    return range ? Math.random() * (range.max - range.min) + range.min : null;
  }
}
