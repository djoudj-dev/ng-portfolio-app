import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import type { AnalyticsOverview } from '@features/analytics';
import { interval, from } from 'rxjs';
import { switchMap, catchError, startWith } from 'rxjs/operators';

interface ChartData {
  date: string;
  day: string;
  humanVisits: number;
  botVisits: number;
  totalVisits: number;
  height: number;
  humanHeight: number;
  botHeight: number;
}

@Component({
  selector: 'app-activity-chart',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background rounded-2xl border border-accent p-6 shadow-sm space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-accent border border-primary rounded-xl flex items-center justify-center shadow-lg"
          >
            <img
              [ngSrc]="'icons/stats.svg'"
              alt="Analytics"
              width="28"
              height="28"
              class="h-7 w-7"
            />
          </div>
          <div>
            <h3 class="text-xl font-bold text-text">Activité sur 7 jours</h3>
            <p class="text-secondary text-sm">Répartition des visiteurs en temps réel</p>
          </div>
        </div>

        <div class="text-right">
          <div class="flex items-center gap-2 mb-1">
            @if (isLoading()) {
              <div
                class="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"
              ></div>
            } @else {
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            }
            <span class="text-sm text-secondary">{{ getCurrentTime() }}</span>
          </div>
          <div class="text-sm font-medium text-green-600">
            {{ isLoading() ? 'Actualisation...' : 'Données à jour' }}
          </div>
        </div>
      </div>

      @if (getChartData().length > 0) {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-text">Répartition des visiteurs (7 jours)</h4>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-sm"></div>
                <span class="text-secondary">Visiteurs</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-sm"
                ></div>
                <span class="text-secondary">Robots/Crawlers</span>
              </div>
            </div>
          </div>

          <div class="bg-background border border-accent rounded-xl p-4">
            <div class="h-64 flex items-end justify-between gap-2">
              @for (day of getChartData(); track day.date) {
                <div class="flex-1 flex flex-col items-center group cursor-pointer">
                  <div class="w-full mb-3 relative" style="height: 200px;">
                    <div class="flex flex-col justify-end h-full">
                      @if (day.botHeight > 0) {
                        <div
                          class="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg shadow-sm transition-all duration-300 group-hover:shadow-lg"
                          [style.height.px]="day.botHeight"
                          [title]="day.botVisits + ' bots le ' + day.day"
                        ></div>
                      }

                      <div
                        class="w-full bg-gradient-to-t from-green-500 to-green-400 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
                        [class.rounded-lg]="day.botHeight === 0"
                        [class.rounded-b-lg]="day.botHeight > 0"
                        [style.height.px]="day.humanHeight"
                        [title]="day.humanVisits + ' visiteurs humains le ' + day.day"
                      >
                        <div
                          class="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="text-center space-y-1">
                    <div class="flex flex-col gap-1">
                      <div class="text-sm font-bold text-green-600">{{ day.humanVisits }}</div>
                      @if (day.botVisits > 0) {
                        <div class="text-xs font-medium text-accent-600">{{ day.botVisits }}</div>
                      }
                    </div>
                    <div class="text-xs text-secondary font-medium">{{ day.day }}</div>
                    <div class="text-xs text-gray-500">{{ day.date }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-secondary">
          <span class="text-6xl mb-4 block">📊</span>
          <p class="text-lg">En attente des données d'activité...</p>
        </div>
      }
    </div>
  `,
})
export class ActivityChartComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  readonly isLoading = signal(true);
  readonly analytics = signal<AnalyticsOverview | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadAnalytics();

    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => from(this.loadAnalytics())),
        catchError((error) => {
          console.error('Erreur actualisation activity chart:', error);
          return [];
        }),
      )
      .subscribe();
  }

  private async loadAnalytics(): Promise<void> {
    this.isLoading.set(true);

    try {
      const data = await this.analyticsService.getAnalyticsOverview({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        period: 'day',
      });

      this.analytics.set(data);
    } catch (error: unknown) {
      console.error('Erreur chargement activity chart:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR');
  }

  getChartData(): ChartData[] {
    const timeline = this.analytics()?.timeline ?? [];
    if (timeline.length === 0) return [];

    const dailyData = new Map<string, { humans: number; bots: number; total: number }>();

    timeline.forEach((stat) => {
      const dateKey = new Date(stat.date).toDateString();
      const current = dailyData.get(dateKey) ?? { humans: 0, bots: 0, total: 0 };

      if (stat.visitorType === 'HUMAN') {
        current.humans += stat.visitCount;
      } else {
        current.bots += stat.visitCount;
      }
      current.total += stat.visitCount;

      dailyData.set(dateKey, current);
    });

    const data = Array.from(dailyData.entries())
      .map(([dateStr, visits]) => {
        const date = new Date(dateStr);
        return {
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          humanVisits: visits.humans,
          botVisits: visits.bots,
          totalVisits: visits.total,
          dateObj: date,
        };
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .slice(-7);

    const maxTotal = Math.max(...data.map((d) => d.totalVisits), 1);
    const maxHeight = 180;

    return data.map((day) => ({
      date: day.date,
      day: day.day,
      humanVisits: day.humanVisits,
      botVisits: day.botVisits,
      totalVisits: day.totalVisits,
      height: Math.max(10, (day.totalVisits / maxTotal) * maxHeight),
      humanHeight: Math.max(5, (day.humanVisits / maxTotal) * maxHeight),
      botHeight: day.botVisits > 0 ? Math.max(3, (day.botVisits / maxTotal) * maxHeight) : 0,
    }));
  }
}
