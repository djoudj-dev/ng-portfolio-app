import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { AnalyticsService } from '@features/analytics';
import type { AnalyticsOverview } from '@features/analytics';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

// Types
interface ChartData {
  readonly date: string;
  readonly day: string;
  readonly humanVisits: number;
  readonly botVisits: number;
  readonly totalVisits: number;
  readonly humanHeight: number;
  readonly botHeight: number;
  readonly fullDate: Date;
}

interface LegendItem {
  readonly color: string;
  readonly label: string;
  readonly value: number;
}

// Constantes
const CHART_CONFIG = {
  maxHeight: 180,
  minBarHeight: 5,
  minBotHeight: 3,
  daysToShow: 7,
  refreshInterval: 30000,
} as const;

const COLORS = {
  human: {
    from: 'from-green-500',
    to: 'to-green-400',
    text: 'text-green-600',
    bg: 'bg-gradient-to-r from-green-400 to-green-600',
  },
  bot: {
    from: 'from-orange-500',
    to: 'to-orange-400',
    text: 'text-orange-600',
    bg: 'bg-gradient-to-r from-orange-400 to-orange-600',
  },
} as const;

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [DatePipe, SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-background rounded-2xl border border-primary/40 shadow-lg shadow-primary/20 backdrop-blur p-6 space-y-6 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-sm"
          >
            <app-svg-icon name="lucide:chart-column" width="28" height="28" class="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-text">Activité sur 7 jours</h3>
            <p class="text-secondary text-sm">Répartition des visiteurs en temps réel</p>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="text-right">
          <div class="flex items-center gap-2 mb-1">
            @if (isLoading()) {
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"
              ></div>
            } @else {
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            }
            <span class="text-sm text-secondary">{{ currentTime() }}</span>
          </div>
          <div class="text-sm font-medium" [class]="isLoading() ? 'text-orange-600' : 'text-green-600'">
            {{ isLoading() ? 'Actualisation...' : 'Données à jour' }}
          </div>
        </div>
      </div>

      @if (chartData().length > 0) {
        <div class="space-y-4">
          <!-- Legend -->
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-text">Répartition des visiteurs (7 jours)</h4>
            <div class="flex items-center gap-4 text-sm">
              @for (item of legendItems(); track item.label) {
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-sm" [class]="item.color"></div>
                  <span class="text-secondary">{{ item.label }}</span>
                  <span class="font-bold" [class]="item.label === 'Visiteurs' ? 'text-green-600' : 'text-orange-600'">
                    {{ item.value }}
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Chart -->
          <div class="bg-background border border-primary/30 rounded-xl p-4 backdrop-blur shadow-sm">
            <div class="h-64 flex items-end justify-between gap-2">
              @for (day of chartData(); track day.date) {
                <div
                  class="flex-1 flex flex-col items-center group cursor-pointer relative"
                  (mouseenter)="setHoveredDay(day)"
                  (mouseleave)="clearHoveredDay()"
                >
                  <!-- Tooltip -->
                  @if (hoveredDay() === day) {
                    <div
                      class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-background border border-primary/40 rounded-lg shadow-lg shadow-primary/20 p-3 min-w-[200px] z-10 backdrop-blur"
                    >
                      <div class="text-xs font-semibold text-text mb-2 border-b border-accent pb-2">
                        {{ day.fullDate | date: 'EEEE d MMMM y':'':'fr' }}
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center justify-between text-xs">
                          <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-green-500"></div>
                            <span class="text-secondary">Visiteurs</span>
                          </div>
                          <span class="font-bold text-green-600">{{ day.humanVisits }}</span>
                        </div>
                        @if (day.botVisits > 0) {
                          <div class="flex items-center justify-between text-xs">
                            <div class="flex items-center gap-2">
                              <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                              <span class="text-secondary">Robots</span>
                            </div>
                            <span class="font-bold text-orange-600">{{ day.botVisits }}</span>
                          </div>
                        }
                        <div class="flex items-center justify-between text-xs pt-1 border-t border-accent mt-1">
                          <span class="text-secondary font-semibold">Total</span>
                          <span class="font-bold text-primary">{{ day.totalVisits }}</span>
                        </div>
                      </div>
                      <!-- Arrow -->
                      <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div class="border-4 border-transparent border-t-background"></div>
                      </div>
                    </div>
                  }

                  <!-- Bars -->
                  <div class="w-full mb-3 relative" style="height: 200px;">
                    <div class="flex flex-col justify-end h-full">
                      @if (day.botHeight > 0) {
                        <div
                          class="w-full bg-gradient-to-t rounded-t-lg shadow-sm transition-all duration-300 group-hover:shadow-lg"
                          [class]="COLORS.bot.from + ' ' + COLORS.bot.to"
                          [style.height.px]="day.botHeight"
                        ></div>
                      }

                      <div
                        class="w-full bg-gradient-to-t shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                        [class]="COLORS.human.from + ' ' + COLORS.human.to"
                        [class.rounded-lg]="day.botHeight === 0"
                        [class.rounded-b-lg]="day.botHeight > 0"
                        [style.height.px]="day.humanHeight"
                      >
                        <div
                          class="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Labels -->
                  <div class="flex flex-col items-center gap-1">
                    <div class="text-xs text-text font-semibold">{{ day.day }}</div>
                    <div class="text-xs text-secondary">{{ day.date }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-secondary">
          <app-svg-icon name="lucide:chart-no-axes-combined" width="64" height="64" class="w-16 h-16 mx-auto mb-4 text-accent" />
          <p class="text-lg font-medium">En attente des données d'activité...</p>
        </div>
      }
    </div>
  `,
})
export class ActivityChartComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly destroyRef = inject(DestroyRef);

  // Expose constants to template
  protected readonly COLORS = COLORS;

  // State
  readonly isLoading = signal(true);
  readonly analytics = signal<AnalyticsOverview | null>(null);
  readonly hoveredDay = signal<ChartData | null>(null);

  // Computed values avec mémoization automatique
  readonly currentTime = computed(() => new Date().toLocaleTimeString('fr-FR'));

  readonly chartData = computed(() => {
    const timeline = this.analytics()?.timeline ?? [];
    if (timeline.length === 0) return [];

    // Group by day
    const dailyData = this.groupByDay(timeline);

    // Convert to array and sort
    const sortedData = Array.from(dailyData.entries())
      .map(([dateStr, visits]) => this.createChartDataPoint(dateStr, visits))
      .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
      .slice(-CHART_CONFIG.daysToShow);

    // Calculate heights
    return this.calculateHeights(sortedData);
  });

  readonly legendItems = computed((): LegendItem[] => {
    const data = this.chartData();
    const humans = data.reduce((sum, d) => sum + d.humanVisits, 0);
    const bots = data.reduce((sum, d) => sum + d.botVisits, 0);

    return [
      { color: COLORS.human.bg, label: 'Visiteurs', value: humans },
      ...(bots > 0 ? [{ color: COLORS.bot.bg, label: 'Robots/Crawlers', value: bots }] : []),
    ];
  });

  ngOnInit(): void {
    // Auto-refresh with takeUntilDestroyed for automatic cleanup
    interval(CHART_CONFIG.refreshInterval)
      .pipe(
        startWith(0),
        switchMap(() => this.loadAnalytics()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  setHoveredDay(day: ChartData): void {
    this.hoveredDay.set(day);
  }

  clearHoveredDay(): void {
    this.hoveredDay.set(null);
  }

  private async loadAnalytics(): Promise<void> {
    this.isLoading.set(true);

    try {
      const startDate = new Date(Date.now() - CHART_CONFIG.daysToShow * 24 * 60 * 60 * 1000);
      const data = await this.analyticsService.getAnalyticsOverview({
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
        period: 'day',
      });

      this.analytics.set(data);
    } catch (error) {
      console.error('Erreur chargement activity chart:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private groupByDay(
    timeline: AnalyticsOverview['timeline'],
  ): Map<string, { humans: number; bots: number; total: number }> {
    const dailyData = new Map<string, { humans: number; bots: number; total: number }>();

    if (!timeline) return dailyData;

    for (const stat of timeline) {
      const dateKey = new Date(stat.date).toDateString();
      const current = dailyData.get(dateKey) ?? { humans: 0, bots: 0, total: 0 };

      if (stat.visitorType === 'HUMAN') {
        current.humans += stat.visitCount;
      } else {
        current.bots += stat.visitCount;
      }
      current.total += stat.visitCount;

      dailyData.set(dateKey, current);
    }

    return dailyData;
  }

  private createChartDataPoint(
    dateStr: string,
    visits: { humans: number; bots: number; total: number },
  ): Omit<ChartData, 'humanHeight' | 'botHeight'> {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      humanVisits: visits.humans,
      botVisits: visits.bots,
      totalVisits: visits.total,
      fullDate: date,
    };
  }

  private calculateHeights(
    data: Omit<ChartData, 'humanHeight' | 'botHeight'>[],
  ): ChartData[] {
    const maxTotal = Math.max(...data.map((d) => d.totalVisits), 1);

    return data.map((day) => ({
      ...day,
      humanHeight: Math.max(
        CHART_CONFIG.minBarHeight,
        (day.humanVisits / maxTotal) * CHART_CONFIG.maxHeight,
      ),
      botHeight:
        day.botVisits > 0
          ? Math.max(
              CHART_CONFIG.minBotHeight,
              (day.botVisits / maxTotal) * CHART_CONFIG.maxHeight,
            )
          : 0,
    }));
  }
}
