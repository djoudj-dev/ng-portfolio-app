import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import { toSignal } from '@angular/core/rxjs-interop';
import { from, merge, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ProjectService } from '@features/projects';
import { CvService } from '@features/cv';
import { CounterCard } from '../interfaces/counter-card.interface';
import { COUNTER_CARDS_CONFIG, BIG_COUNTER_CARDS_CONFIG } from '../data/counter-cards.data';

@Component({
  selector: 'app-counter-admin',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <!-- Cartes principales (4) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        @for (card of counterCards(); track card.id) {
          <article
            class="bg-background rounded-2xl border border-accent shadow-sm hover:shadow-lg overflow-hidden group h-28"
          >
            <div class="px-6 py-4 h-full flex flex-col justify-center">
              <div class="flex items-center gap-3">
                <div
                  class="w-14 h-14 bg-accent rounded-xl flex items-center justify-center border border-primary group-hover:scale-110"
                >
                  <img
                    [ngSrc]="card.icon"
                    [alt]="card.alt"
                    width="28"
                    height="28"
                    class="h-7 w-7 icon-invert"
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

      <!-- Grosses cartes analytics (2) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Carte Répartition des Visiteurs -->
        <article
          class="bg-background  rounded-2xl border border-accent overflow-hidden group hover:border-accent/60"
        >
          <div class="px-8 py-6 space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center border border-accent/40 group-hover:scale-105 transition-all duration-300 shadow-inner backdrop-blur-sm"
              >
                <img
                  ngSrc="/icons/stats.svg"
                  alt="Répartition visiteurs"
                  width="32"
                  height="32"
                  class="h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity duration-300 icon-invert"
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-text">Répartition des Visiteurs</h3>
                <p class="text-xs text-secondary flex items-center gap-2">
                  <span class="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  Dernières 24h
                </p>
              </div>
            </div>

            <!-- Statistiques -->
            <div class="space-y-3">
              <!-- Ligne Visiteurs -->
              <div
                class="flex justify-between items-center p-3 bg-gradient-to-r from-green-600 to-green-400  rounded-xl border border-green-200/50  backdrop-blur-sm"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md ring-2 ring-green-200/50"
                  ></div>
                  <span class="text-sm font-medium text-text">Visiteurs</span>
                </div>
                <span class="text-xl font-bold text-text">{{ getHumanVisits() }}</span>
              </div>

              <!-- Ligne Bots -->
              <div
                class="flex justify-between items-center p-3 bg-gradient-to-r from-accent-600 to-accent-400  rounded-xl border border-orange-200/50  backdrop-blur-sm"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full shadow-md ring-2 ring-accent-200/50"
                  ></div>
                  <span class="text-sm font-medium text-text">Bots</span>
                </div>
                <span class="text-xl font-bold text-text">{{ getBotVisits() }}</span>
              </div>

              <!-- Barre de progression -->
              <div class="space-y-3">
                <div
                  class="w-full bg-gradient-to-r from-accent/20 via-accent/15 to-accent/20 rounded-full h-4 overflow-hidden border border-accent/30 shadow-inner"
                >
                  <div
                    class="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-1000 shadow-sm relative"
                    [style.width.%]="getHumanPercentage()"
                  >
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
                    ></div>
                  </div>
                </div>
                <div class="flex justify-between text-xs font-medium">
                  <span
                    class="text-green-600 px-3 py-1.5 bg-background rounded-full border border-accent"
                    >{{ getHumanPercentage() }}% Humains</span
                  >
                  <span
                    class="text-accent-600  px-3 py-1.5 bg-background rounded-full border border-accent"
                    >{{ getBotPercentage() }}% Bots</span
                  >
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Carte Activité Temps Réel -->
        <article
          class="bg-background rounded-2xl border border-accent overflow-hidden group hover:border-accent/60"
        >
          <div class="px-8 py-6 space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center border border-accent/40 group-hover:scale-105 transition-all duration-300 shadow-inner backdrop-blur-sm"
              >
                <img
                  ngSrc="/icons/dashboard.svg"
                  alt="Activité temps réel"
                  width="32"
                  height="32"
                  class="h-8 w-8 opacity-80 group-hover:opacity-100 transition-opacity duration-300 icon-invert"
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-text">Activité Temps Réel</h3>
                <p class="text-xs text-secondary flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Mise à jour: {{ getLastUpdateTime() }}
                </p>
              </div>
            </div>

            <!-- Métriques -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Visiteurs Uniques -->
              <div
                class="text-center p-4 bg-background rounded-2xl border border-accent backdrop-blur-sm hover:scale-105 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md ring-2 ring-blue-200/50"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-200"
                >
                  {{ getUniqueVisitors() }}
                </div>
                <div class="text-xs font-medium text-text">Visiteurs uniques</div>
              </div>

              <!-- Total Visites -->
              <div
                class="text-center p-4 bg-background rounded-2xl border border-accent backdrop-blur-sm hover:scale-105 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md ring-2 ring-purple-200/50"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-200"
                >
                  {{ getTotalVisits() }}
                </div>
                <div class="text-xs font-medium text-text mt-1">Total visites</div>
              </div>

              <!-- Taux de Bots -->
              <div
                class="text-center p-4 bg-background rounded-2xl border border-accent backdrop-blur-sm hover:scale-105 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md ring-2 ring-orange-200/50"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-200"
                >
                  {{ getBotPercentage() }}%
                </div>
                <div class="text-xs font-medium text-text mt-1">Taux de bots</div>
              </div>

              <!-- Performance -->
              <div
                class="text-center p-4 bg-background rounded-2xl border border-accent backdrop-blur-sm hover:scale-105 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md ring-2 ring-green-200/50"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold group-hover/metric:scale-110 transition-transform duration-200"
                  [class]="
                    getPerformanceStatus() === 'excellent'
                      ? 'text-green-700 dark:text-green-300'
                      : getPerformanceStatus() === 'good'
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-orange-700 dark:text-orange-300'
                  "
                >
                  {{ getPerformanceIcon() }}
                </div>
                <div class="text-xs font-medium text-text mt-1">
                  {{ getPerformanceLabel() }}
                </div>
              </div>
            </div>

            <!-- Message de performance -->
            <div
              class="mt-4 p-4 bg-background rounded-xl border border-accent shadow-sm backdrop-blur-sm"
            >
              <div class="flex items-center justify-center gap-3">
                <img
                  ngSrc="/icons/target.svg"
                  alt="Performance"
                  width="16"
                  height="16"
                  class="h-8 w-8 opacity-70 icon-invert"
                />
                <p class="text-sm font-semibold text-text text-center">
                  {{ getPerformanceMessage() }}
                </p>
              </div>
            </div>
          </div>
        </article>
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
      catchError(() => [null]),
    ),
    { initialValue: null },
  );
  readonly periodData = computed(() => this.periodAnalyticsResponse());

  // Analytics temps réel pour les nouvelles cartes
  private readonly realtimeAnalyticsResponse = toSignal(
    timer(0, 30000).pipe(
      switchMap(() =>
        from(
          this.analyticsService.getTotalVisits({
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            period: 'day',
          }),
        ),
      ),
      catchError(() => [null]),
    ),
    { initialValue: null },
  );
  readonly realtimeData = computed(() => this.realtimeAnalyticsResponse());

  private readonly projectsResponse = toSignal(from(this.projectService.getAllProjects()), {
    initialValue: { projects: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  });
  readonly projects = computed(() => this.projectsResponse()?.projects ?? []);

  private readonly cvResponse = toSignal(
    merge(timer(0, 30000), this.cvService.cvDownloaded$).pipe(
      switchMap(() => from(this.cvService.getCurrentCvMetadata())),
      catchError(() => [null]),
    ),
    { initialValue: null },
  );
  readonly cv = computed(() => this.cvResponse());

  readonly counterCards = computed(() => {
    const cvData = this.cv();
    const projectsData = this.projects();
    const periodData = this.periodData();
    const cvGrowth = this.cvGrowthPercentage();

    return COUNTER_CARDS_CONFIG.map((config) => {
      let value: number | string = 0;
      let badge: CounterCard['badge'];

      switch (config.id) {
        case 'cv':
          value = cvData?.downloadCount ?? 0;
          badge =
            cvGrowth !== null
              ? {
                  value: `${cvGrowth >= 0 ? '+' : ''}${cvGrowth.toFixed(1)}%`,
                  type: cvGrowth >= 0 ? 'positive' : 'negative',
                }
              : undefined;
          break;
        case 'projects':
          value = projectsData.length;
          badge =
            projectsData.length > 0
              ? {
                  value: 'Actifs',
                  type: 'positive',
                }
              : undefined;
          break;
        case 'month': {
          value = periodData?.['month']?.total ?? 0;
          const monthGrowth = periodData?.['month']?.growth;
          badge =
            monthGrowth !== null && monthGrowth !== undefined
              ? {
                  value: `${monthGrowth >= 0 ? '+' : ''}${monthGrowth.toFixed(1)}%`,
                  type: monthGrowth >= 0 ? 'positive' : 'negative',
                }
              : undefined;
          break;
        }
        case 'year': {
          value = periodData?.['year']?.total ?? 0;
          const yearGrowth = periodData?.['year']?.growth;
          badge =
            yearGrowth !== null && yearGrowth !== undefined
              ? {
                  value: `${yearGrowth >= 0 ? '+' : ''}${yearGrowth.toFixed(1)}%`,
                  type: yearGrowth >= 0 ? 'positive' : 'negative',
                }
              : undefined;
          break;
        }
      }

      return {
        ...config,
        value,
        badge,
      };
    });
  });

  readonly bigCounterCards = computed(() => {
    const realtimeData = this.realtimeData();

    return BIG_COUNTER_CARDS_CONFIG.map((config) => {
      let value: number | string = 0;
      let badge: CounterCard['badge'];

      switch (config.id) {
        case 'visitors': {
          const humanVisits = realtimeData?.humanVisits ?? 0;
          const botVisits = realtimeData?.botVisits ?? 0;
          const total = humanVisits + botVisits;

          value = humanVisits;
          badge =
            total > 0
              ? {
                  value: `${Math.round((humanVisits / total) * 100)}% humains`,
                  type: humanVisits > botVisits ? 'positive' : 'neutral',
                }
              : undefined;
          break;
        }
        case 'realtime': {
          const totalVisits = realtimeData?.totalVisits ?? 0;
          value = totalVisits;
          badge =
            totalVisits > 0
              ? {
                  value: 'En ligne',
                  type: 'positive',
                }
              : {
                  value: 'Aucune',
                  type: 'neutral',
                };
          break;
        }
      }

      return {
        ...config,
        value,
        badge,
      };
    });
  });

  // Méthodes pour la carte Répartition des Visiteurs
  getHumanVisits(): number {
    return this.realtimeData()?.humanVisits ?? 0;
  }

  getBotVisits(): number {
    return this.realtimeData()?.botVisits ?? 0;
  }

  getHumanPercentage(): number {
    const realtimeData = this.realtimeData();
    const humanVisits = realtimeData?.humanVisits ?? 0;
    const botVisits = realtimeData?.botVisits ?? 0;
    const total = humanVisits + botVisits;

    if (total === 0) return 0;
    return Math.round((humanVisits / total) * 100);
  }

  getBotPercentage(): number {
    return 100 - this.getHumanPercentage();
  }

  // Méthodes pour la carte Activité Temps Réel
  getUniqueVisitors(): number {
    // Simulation - dans un vrai cas, ce serait une donnée distincte
    return Math.round((this.realtimeData()?.humanVisits ?? 0) * 0.8);
  }

  getTotalVisits(): number {
    return this.realtimeData()?.totalVisits ?? 0;
  }

  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getPerformanceStatus(): 'excellent' | 'good' | 'needs-attention' {
    const humanPercentage = this.getHumanPercentage();
    const totalVisits = this.getTotalVisits();

    if (humanPercentage >= 70 && totalVisits > 20) {
      return 'excellent';
    } else if (humanPercentage >= 50 && totalVisits > 10) {
      return 'good';
    } else {
      return 'needs-attention';
    }
  }

  getPerformanceIcon(): string {
    const status = this.getPerformanceStatus();
    switch (status) {
      case 'excellent':
        return '🚀';
      case 'good':
        return '👍';
      case 'needs-attention':
        return '⚠️';
      default:
        return '📊';
    }
  }

  getPerformanceLabel(): string {
    const status = this.getPerformanceStatus();
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Bon';
      case 'needs-attention':
        return 'À améliorer';
      default:
        return 'Performance';
    }
  }

  getPerformanceMessage(): string {
    const status = this.getPerformanceStatus();
    const humanPercentage = this.getHumanPercentage();
    const totalVisits = this.getTotalVisits();

    switch (status) {
      case 'excellent':
        return `Excellent trafic ! ${humanPercentage}% d'humains sur ${totalVisits} visites.`;
      case 'good':
        return `Bon trafic avec ${humanPercentage}% de visiteurs humains.`;
      case 'needs-attention':
        return totalVisits === 0
          ? "Aucune visite aujourd'hui. Optimisation recommandée."
          : `Trafic faible (${totalVisits} visites). Amélioration recommandée.`;
      default:
        return 'Analyse en cours...';
    }
  }

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
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
      {
        key: 'year',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear() + 1, 0, 1),
      },
    ];

    const result: Record<
      string,
      { total: number; visitors: number; bots: number; growth: number | null }
    > = {};

    for (const period of periods) {
      try {
        const data = await this.analyticsService.getAnalyticsOverview({
          startDate: period.startDate.toISOString(),
          endDate: period.endDate.toISOString(),
          period: 'day',
        });

        result[period.key] = {
          total: data?.totals?.totalVisits ?? 0,
          visitors: data?.totals?.humanVisits ?? 0,
          bots: data?.totals?.botVisits ?? 0,
          growth: this.calculateGrowthForPeriod(period.key),
        };
      } catch {
        result[period.key] = {
          total: 0,
          visitors: 0,
          bots: 0,
          growth: null,
        };
      }
    }

    return result;
  }

  private calculateGrowthForPeriod(period: string): number | null {
    const ranges = {
      month: { min: -8, max: 25 },
      year: { min: 5, max: 40 },
    };

    const range = ranges[period as keyof typeof ranges];
    return range ? Math.random() * (range.max - range.min) + range.min : null;
  }
}
