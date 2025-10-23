import { Component, ChangeDetectionStrategy, signal, inject, computed, DestroyRef } from '@angular/core';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';
import { AnalyticsService } from '@features/admin';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, from, EMPTY } from 'rxjs';
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
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 p-6 space-y-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 border border-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <app-svg-icon
              name="ph:activity"
              class="w-6 h-6 text-text"
              width="24"
              height="24"
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
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500"></span>
            }
            <span class="text-sm text-secondary">{{ getCurrentTime() }}</span>
          </div>
          <div class="text-sm font-medium text-green-600">
            {{ isLoading() ? 'Actualisation...' : 'Données à jour' }}
          </div>
        </div>
      </div>

      @if (chartData().length > 0) {
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-semibold text-text">Répartition des visiteurs (7 jours)</h4>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur-sm">
                <div
                  class="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-sm shadow-sm"
                ></div>
                <span class="text-secondary font-medium">Visiteurs</span>
                <span class="text-sm font-bold text-green-600">{{ totals().humans }}</span>
              </div>
              @if (totals().bots > 0) {
                <div class="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full backdrop-blur-sm">
                  <div
                    class="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-sm shadow-sm"
                  ></div>
                  <span class="text-secondary font-medium">Robots</span>
                  <span class="text-sm font-bold text-orange-600">{{ totals().bots }}</span>
                </div>
              }
            </div>
          </div>

          <div class="bg-background/60 backdrop-blur-sm border border-accent rounded-xl p-4 shadow-inner">
            <div class="h-72 flex items-end justify-between gap-2">
              @for (day of chartData(); track day.date) {
                <div class="flex-1 flex flex-col items-center group cursor-pointer">
                  <!-- Nombre total de visites au-dessus de la colonne -->
                  <div class="mb-2 min-h-[20px] flex items-end justify-center">
                    <span class="text-xs font-bold text-text bg-accent/20 px-2 py-1 rounded-md border border-accent/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {{ day.totalVisits }}
                    </span>
                  </div>

                  <div class="w-full mb-3 relative" style="height: 200px;">
                    <div class="flex flex-col justify-end h-full relative">
                      <!-- Nombre de visites affiché sur la colonne -->
                      <div class="absolute inset-x-0 top-0 flex flex-col items-center justify-start z-10 pointer-events-none">
                        <div class="bg-background/90 backdrop-blur-sm border border-accent px-2 py-1 rounded-lg shadow-lg">
                          <div class="text-xs font-bold text-text">{{ day.totalVisits }}</div>
                        </div>
                      </div>

                      @if (day.botHeight > 0) {
                        <div
                          class="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-orange-500/30 relative"
                          [style.height.px]="day.botHeight"
                          [title]="day.botVisits + ' bots le ' + day.day"
                        >
                          <!-- Nombre de bots si significatif -->
                          @if (day.botVisits > 0) {
                            <div class="absolute inset-0 flex items-center justify-center">
                              <span class="text-xs font-semibold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                {{ day.botVisits }} 🤖
                              </span>
                            </div>
                          }
                        </div>
                      }

                      <div
                        class="w-full bg-gradient-to-t from-green-500 to-green-400 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-500/30 group-hover:scale-105 relative"
                        [class.rounded-lg]="day.botHeight === 0"
                        [class.rounded-b-lg]="day.botHeight > 0"
                        [style.height.px]="day.humanHeight"
                        [title]="day.humanVisits + ' visiteurs le ' + day.day"
                      >
                        <div
                          class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        ></div>
                        <!-- Nombre de visiteurs si significatif -->
                        @if (day.humanVisits > 0 && day.humanHeight > 30) {
                          <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-xs font-semibold text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                              {{ day.humanVisits }} 👤
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col items-center space-y-1">
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
          <span class="text-6xl mb-4 block">📊</span>
          <p class="text-lg">En attente des données d'activité...</p>
        </div>
      }
    </div>
  `,
})
export class ActivityChartComponent {
  private readonly analyticsService = inject(AnalyticsService);

  // Observable auto-rafraîchissant toutes les 30s avec toSignal
  private readonly analytics$ = interval(30000).pipe(
    startWith(0),
    switchMap(() =>
      from(
        this.analyticsService.getAnalyticsOverview({
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          period: 'day',
        })
      )
    ),
    catchError((error) => {
      console.error('Erreur chargement activity chart:', error);
      return EMPTY;
    })
  );

  // Signal auto-géré avec cleanup automatique
  readonly analytics = toSignal(this.analytics$, { initialValue: null });
  readonly isLoading = computed(() => this.analytics() === null);

  // Computed pour obtenir l'heure actuelle de manière réactive
  readonly currentTime = signal(new Date().toLocaleTimeString('fr-FR'));

  constructor() {
    // Mettre à jour l'heure toutes les secondes
    const timeInterval = setInterval(() => {
      this.currentTime.set(new Date().toLocaleTimeString('fr-FR'));
    }, 1000);

    // Cleanup automatique
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timeInterval);
    });
  }

  getCurrentTime(): string {
    return this.currentTime();
  }

  // Computed memoïsé pour les données du graphique
  readonly chartData = computed<ChartData[]>(() => {
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
  });

  // Computed memoïsé pour les totaux
  readonly totals = computed(() => {
    const data = this.chartData();
    let humans = 0;
    let bots = 0;
    for (const d of data) {
      humans += d.humanVisits;
      bots += d.botVisits;
    }
    return { humans, bots };
  });
}
