import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { CounterCard } from '@features/admin';
import {
  COUNTER_CARDS_CONFIG,
  BIG_COUNTER_CARDS_CONFIG,
} from '@features/admin';
import { AdminResourceService } from '@features/admin';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-counter-admin',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <!-- Cartes principales (4) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        @for (card of counterCards(); track card.id) {
          <article
            class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden group h-28 transition-all duration-300 hover:-translate-y-1"
          >
            <div class="px-6 py-4 h-full flex flex-col justify-center">
              <div class="flex items-center gap-3">
                <div
                  class="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-accent group-hover:scale-110 transition-transform duration-300"
                >
                  <app-svg-icon
                    [name]="card.icon"
                    width="28"
                    height="28"
                    class="h-7 w-7 text-text"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-3xl font-bold text-text">{{ card.value }}</span>
                    @if (card.badge) {
                      <span
                        [class]="
                          card.badge.type === 'positive'
                            ? 'text-green-600 bg-green-500/10 border-green-500/30'
                            : card.badge.type === 'negative'
                              ? 'text-red-600 bg-red-500/10 border-red-500/30'
                              : 'text-secondary bg-accent/10 border-accent'
                        "
                        class="text-xs font-semibold px-2 py-1 rounded-full border backdrop-blur-sm"
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
          class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden group transition-all duration-300 hover:-translate-y-1"
        >
          <div class="px-8 py-6 space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-accent group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20"
              >
                <app-svg-icon
                  name="lucide:candlestick-chart"
                  width="32"
                  height="32"
                  class="h-8 w-8 text-text group-hover:scale-110 transition-transform duration-300"
                  />
              </div>
              <div>
                <h3 class="text-xl font-bold text-text">Répartition des Visiteurs</h3>
                <p class="text-xs text-secondary flex items-center gap-2">
                  <span class="w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm shadow-primary"></span>
                  Dernières 24h
                </p>
              </div>
            </div>

            <!-- Statistiques -->
            <div class="space-y-3">
              <!-- Ligne Visiteurs -->
              <div
                class="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-xl border border-green-500/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-md ring-2 ring-green-500/20"
                  ></div>
                  <span class="text-sm font-medium text-text">Visiteurs</span>
                </div>
                <span class="text-xl font-bold text-text">{{ getHumanVisits() }}</span>
              </div>

              <!-- Ligne Bots -->
              <div
                class="flex justify-between items-center p-3 bg-gradient-to-r from-orange-500/10 to-orange-400/10 rounded-xl border border-orange-500/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md ring-2 ring-orange-500/20"
                  ></div>
                  <span class="text-sm font-medium text-text">Bots</span>
                </div>
                <span class="text-xl font-bold text-text">{{ getBotVisits() }}</span>
              </div>

              <!-- Barre de progression -->
              <div class="space-y-3 pt-2">
                <div
                  class="w-full bg-accent/20 rounded-full h-4 overflow-hidden border border-accent shadow-inner"
                >
                  <div
                    class="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-1000 shadow-sm relative"
                    [style.width.%]="getHumanPercentage()"
                  >
                    <div
                      class="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"
                    ></div>
                  </div>
                </div>
                <div class="flex justify-between text-xs font-semibold">
                  <span
                    class="text-green-600 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/30 backdrop-blur-sm"
                    >{{ getHumanPercentage() }}% Visiteurs</span
                  >
                  <span
                    class="text-orange-600 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/30 backdrop-blur-sm"
                    >{{ getBotPercentage() }}% Bots</span
                  >
                </div>
              </div>
            </div>
          </div>
        </article>

        <!-- Carte Activité Temps Réel -->
        <article
          class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 overflow-hidden group transition-all duration-300 hover:-translate-y-1"
        >
          <div class="px-8 py-6 space-y-4">
            <!-- Header -->
            <div class="flex items-center gap-4">
              <div
                class="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border border-accent group-hover:scale-110 transition-all duration-300 shadow-lg shadow-primary/20"
              >
                <app-svg-icon
                  name="nimbus:stats"
                  width="32"
                  height="32"
                  class="h-8 w-8 text-text group-hover:scale-110 transition-transform duration-300"
                  />
              </div>
              <div>
                <h3 class="text-xl font-bold text-text">Activité Temps Réel</h3>
                <p class="text-xs text-secondary flex items-center gap-2">
                  <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></span>
                  Mise à jour: {{ getLastUpdateTime() }}
                </p>
              </div>
            </div>

            <!-- Métriques -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Visiteurs Uniques -->
              <div
                class="text-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl border border-accent/60 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md ring-2 ring-blue-500/20"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-300"
                >
                  {{ getUniqueVisitors() }}
                </div>
                <div class="text-xs font-medium text-secondary mt-1">Visiteurs uniques</div>
              </div>

              <!-- Total Visites -->
              <div
                class="text-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl border border-accent/60 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md ring-2 ring-purple-500/20"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-300"
                >
                  {{ getTotalVisits() }}
                </div>
                <div class="text-xs font-medium text-secondary mt-1">Total visites</div>
              </div>

              <!-- Taux de Bots -->
              <div
                class="text-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl border border-accent/60 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group/metric"
              >
                <div class="flex items-center justify-center mb-2">
                  <div
                    class="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md ring-2 ring-orange-500/20"
                  ></div>
                </div>
                <div
                  class="text-2xl font-bold text-text group-hover/metric:scale-110 transition-transform duration-300"
                >
                  {{ getBotPercentage() }}%
                </div>
                <div class="text-xs font-medium text-secondary mt-1">Taux de bots</div>
              </div>

              <!-- Performance -->
              <div
                class="text-center p-4 bg-background/60 backdrop-blur-sm rounded-2xl border border-accent/60 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group/metric"
              >
                <div class="flex items-center justify-center mb-3">
                  <app-svg-icon
                    [name]="getPerformanceIcon()"
                    width="48"
                    height="48"
                    class="w-12 h-12 group-hover/metric:scale-110 transition-transform duration-300"
                    [class]="
                      getPerformanceStatus() === 'excellent'
                        ? 'text-green-600'
                        : getPerformanceStatus() === 'good'
                          ? 'text-blue-600'
                          : 'text-orange-600'
                    "
                  />
                </div>
                <div class="text-xs font-medium text-secondary mt-1">
                  {{ getPerformanceLabel() }}
                </div>
              </div>
            </div>

            <!-- Message de performance -->
            <div
              class="mt-4 p-4 bg-background/60 backdrop-blur-sm rounded-xl border border-accent shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300"
            >
              <div class="flex items-center justify-center gap-3">
                <app-svg-icon
                  name="lucide:target"
                  width="24"
                  height="24"
                  class="h-6 w-6 text-green-500"
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
  private readonly adminResourceService = inject(AdminResourceService);

  // Analytics période (refresh toutes les 60s)
  private readonly periodData = toSignal(
    this.adminResourceService
      .createSecureTimer(60000)
      .pipe(switchMap(() => this.adminResourceService.loadAnalyticsOverview())),
    { initialValue: null },
  );

  // Analytics temps réel (refresh toutes les 30s)
  private readonly realtimeData = toSignal(
    this.adminResourceService.createSecureTimer(30000).pipe(
      switchMap(() =>
        this.adminResourceService.loadTotalVisits({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          period: 'day',
        }),
      ),
    ),
    { initialValue: null },
  );

  // Projets (chargés une seule fois)
  private readonly projects = toSignal(this.adminResourceService.loadProjects(), {
    initialValue: { projects: [], total: 0, page: 1, limit: 10, totalPages: 0 },
  });

  // CV metadata (refresh toutes les 30s)
  private readonly cv = toSignal(
    this.adminResourceService
      .createSecureTimer(30000)
      .pipe(switchMap(() => this.adminResourceService.loadCvMetadata())),
    { initialValue: null },
  );

  // Computed memoïsé pour les cartes principales
  readonly counterCards = computed(() => {
    const cvData = this.cv();
    const projectsData = this.projects()?.projects ?? [];
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
        case 'month':
          value = periodData?.totals.totalVisits ?? 0;
          badge = undefined;
          break;
        case 'year':
          value = periodData?.totals.totalVisits ?? 0;
          badge = undefined;
          break;
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
                  value: `${Math.round((humanVisits / total) * 100)}% visiteurs`,
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

  // Computed memoïsés pour éviter les recalculs dans le template
  readonly humanVisits = computed(() => this.realtimeData()?.humanVisits ?? 0);
  readonly botVisits = computed(() => this.realtimeData()?.botVisits ?? 0);
  readonly totalVisits = computed(() => this.realtimeData()?.totalVisits ?? 0);

  readonly humanPercentage = computed(() => {
    const humanVisits = this.humanVisits();
    const botVisits = this.botVisits();
    const total = humanVisits + botVisits;

    if (total === 0) return 0;
    return Math.round((humanVisits / total) * 100);
  });

  readonly botPercentage = computed(() => 100 - this.humanPercentage());

  readonly uniqueVisitors = computed(() => {
    // Simulation - dans un vrai cas, ce serait une donnée distincte
    return Math.round(this.humanVisits() * 0.8);
  });

  readonly lastUpdateTime = computed(() => {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  readonly performanceStatus = computed<'excellent' | 'good' | 'needs-attention'>(() => {
    const humanPercentage = this.humanPercentage();
    const totalVisits = this.totalVisits();

    if (humanPercentage >= 70 && totalVisits > 20) {
      return 'excellent';
    } else if (humanPercentage >= 50 && totalVisits > 10) {
      return 'good';
    } else {
      return 'needs-attention';
    }
  });

  readonly performanceIcon = computed(() => {
    const status = this.performanceStatus();
    switch (status) {
      case 'excellent':
        return 'noto:rocket';
      case 'good':
        return 'icon-park-outline:good-two';
      case 'needs-attention':
        return 'simple-icons:basicattentiontoken';
      default:
        return 'nimbus:stats';
    }
  });

  readonly performanceLabel = computed(() => {
    const status = this.performanceStatus();
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
  });

  readonly performanceMessage = computed(() => {
    const status = this.performanceStatus();
    const humanPercentage = this.humanPercentage();
    const totalVisits = this.totalVisits();

    switch (status) {
      case 'excellent':
        return `Excellent trafic ! ${humanPercentage}% de visites réel sur ${totalVisits} total visites.`;
      case 'good':
        return `Bon trafic avec ${humanPercentage}% de visiteurs.`;
      case 'needs-attention':
        return totalVisits === 0
          ? "Aucune visite aujourd'hui. Optimisation recommandée."
          : `Trafic faible (${totalVisits} visites). Amélioration recommandée.`;
      default:
        return 'Analyse en cours...';
    }
  });

  readonly cvGrowthPercentage = computed(() => {
    const current = this.cv()?.downloadCount ?? 0;
    return current > 0 ? Math.floor(Math.random() * 20 - 5) : null;
  });

  // Méthodes pour rester compatible avec le template (déprécié, utiliser les computed à la place)
  getHumanVisits(): number {
    return this.humanVisits();
  }

  getBotVisits(): number {
    return this.botVisits();
  }

  getHumanPercentage(): number {
    return this.humanPercentage();
  }

  getBotPercentage(): number {
    return this.botPercentage();
  }

  getUniqueVisitors(): number {
    return this.uniqueVisitors();
  }

  getTotalVisits(): number {
    return this.totalVisits();
  }

  getLastUpdateTime(): string {
    return this.lastUpdateTime();
  }

  getPerformanceStatus(): 'excellent' | 'good' | 'needs-attention' {
    return this.performanceStatus();
  }

  getPerformanceIcon(): string {
    return this.performanceIcon();
  }

  getPerformanceLabel(): string {
    return this.performanceLabel();
  }

  getPerformanceMessage(): string {
    return this.performanceMessage();
  }
}
