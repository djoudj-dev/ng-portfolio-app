import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '@features/admin/features/analytics';
import { toSignal } from '@angular/core/rxjs-interop';
import { timer, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';

interface PeriodData {
  period: string;
  icon: string;
  visitors: number;
  bots: number;
  total: number;
  growth: number | null;
}

@Component({
  selector: 'app-period-counters',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background rounded-2xl border border-accent p-6 shadow-sm">
      @if (isLoading()) {
        <div class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-primary-200 border-t-primary-600"
          ></div>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (periodData of periodsData(); track periodData.period) {
            <div
              class="bg-gradient-to-br from-background to-gray-50 rounded-xl border border-accent p-4 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20"
                >
                  <span class="text-xl">{{ periodData.icon }}</span>
                </div>
                <div>
                  <div class="font-semibold text-text">{{ periodData.period }}</div>
                  <div class="text-sm text-secondary">Total: {{ periodData.total }} visites</div>
                </div>
              </div>

              <!-- Bots -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-orange-600">🤖</span>
                  <span class="text-sm text-secondary">Bots</span>
                </div>
                <div class="text-right">
                  <div class="font-bold text-orange-600">{{ periodData.bots }}</div>
                  <div class="text-xs text-orange-500">{{ getBotPercentage(periodData) }}%</div>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="mt-3">
                <div class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="bg-green-500 transition-all duration-500"
                    [style.width.%]="getHumanPercentage(periodData)"
                  ></div>
                  <div
                    class="bg-orange-500 transition-all duration-500"
                    [style.width.%]="getBotPercentage(periodData)"
                  ></div>
                </div>
              </div>

              <!-- Croissance -->
              @if (periodData.growth !== null) {
                <div class="flex items-center justify-center pt-2">
                  <span
                    [class]="
                      periodData.growth >= 0
                        ? 'text-green-600 bg-green-100'
                        : 'text-red-600 bg-red-100'
                    "
                    class="text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {{ periodData.growth >= 0 ? '+' : '' }}{{ periodData.growth.toFixed(1) }}%
                  </span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class PeriodCountersComponent {
  private readonly analyticsService = inject(AnalyticsService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  private readonly periodAnalytics = toSignal(
    timer(0, 60000).pipe(
      tap(() => this.isLoading.set(true)),
      switchMap(() => this.loadAllPeriods()),
      tap(() => this.isLoading.set(false)),
      catchError((error) => {
        console.error('Erreur chargement compteurs période:', error);
        this.error.set(error instanceof Error ? error.message : 'Erreur inconnue');
        this.isLoading.set(false);
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  readonly periodsData = computed(() => this.periodAnalytics());

  private async loadAllPeriods(): Promise<PeriodData[]> {
    const now = new Date();

    const periods = [
      {
        period: 'Jour',
        icon: '📅',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
      {
        period: 'Semaine',
        icon: '📈',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: now,
      },
      {
        period: 'Mois',
        icon: '📊',
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
      {
        period: 'Annee',
        icon: '📋',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear() + 1, 0, 1),
      },
    ];

    // Charger les données pour chaque période
    const results: PeriodData[] = [];

    for (const period of periods) {
      try {
        const data = await this.analyticsService.getAnalyticsOverview({
          startDate: period.startDate.toISOString(),
          endDate: period.endDate.toISOString(),
          period: 'day',
        });

        // Calculer la croissance (simulation pour l'instant)
        const growth = this.calculateGrowth(period.period);

        results.push({
          period: period.period,
          icon: period.icon,
          visitors: data?.totals?.humanVisits || 0,
          bots: data?.totals?.botVisits || 0,
          total: data?.totals?.totalVisits || 0,
          growth,
        });
      } catch (error) {
        console.warn(`Erreur chargement période ${period.period}:`, error);
        results.push({
          period: period.period,
          icon: period.icon,
          visitors: 0,
          bots: 0,
          total: 0,
          growth: null,
        });
      }
    }

    return results;
  }

  private calculateGrowth(period: string): number | null {
    const growthRanges = {
      Jour: { min: -10, max: 20 },
      Semaine: { min: -5, max: 15 },
      Mois: { min: -8, max: 25 },
      Annee: { min: 5, max: 40 },
    };

    const range = growthRanges[period as keyof typeof growthRanges];
    if (!range) return null;

    return Math.random() * (range.max - range.min) + range.min;
  }

  getHumanPercentage(periodData: PeriodData): number {
    if (periodData.total === 0) return 0;
    return Math.round((periodData.visitors / periodData.total) * 100);
  }

  getBotPercentage(periodData: PeriodData): number {
    if (periodData.total === 0) return 0;
    return Math.round((periodData.bots / periodData.total) * 100);
  }
}
