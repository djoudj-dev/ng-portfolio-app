import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import type { AnalyticsOverview, TrafficSource } from '@features/analytics';
import { TimelineChartComponent } from '@features/analytics';

@Component({
  selector: 'app-analytics-overview',
  imports: [CommonModule, TimelineChartComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Analytics Header -->
      <header class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <img
              [ngSrc]="'/icons/stats.svg'"
              alt="Logo du CV"
              width="24"
              height="24"
              class="h-6 w-6"
            />
          </div>
          <h2 class="text-xl font-semibold text-text">Analytics en temps réel</h2>
        </div>
        <div class="text-sm text-secondary">Dernières 24h</div>
      </header>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center gap-2">
            <span class="text-red-500">⚠️</span>
            <p class="text-red-700 text-sm">{{ error() }}</p>
          </div>
        </div>
      } @else if (analytics()) {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Total Visits -->
          <div class="bg-background rounded-xl border border-accent p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">👁️</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-text">
                  {{ analytics()?.totals?.totalVisits || 0 }}
                </p>
                <p class="text-sm text-secondary">Visites totales</p>
              </div>
            </div>
          </div>

          <!-- Unique Visitors -->
          <div class="bg-background rounded-xl border border-accent p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">👤</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-text">
                  {{ analytics()?.totals?.uniqueVisitors || 0 }}
                </p>
                <p class="text-sm text-secondary">Visiteurs uniques</p>
              </div>
            </div>
          </div>

          <!-- Human Visits -->
          <div class="bg-background rounded-xl border border-accent p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">🧑</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-text">
                  {{ analytics()?.totals?.humanVisits || 0 }}
                </p>
                <p class="text-sm text-secondary">Visites humaines</p>
              </div>
            </div>
          </div>

          <!-- Bot Visits -->
          <div class="bg-background rounded-xl border border-accent p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <span class="text-lg">🤖</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-text">
                  {{ analytics()?.totals?.botVisits || 0 }}
                </p>
                <p class="text-sm text-secondary">Visites bots</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic Sources & Top Pages -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Traffic Sources -->
          <div class="bg-background rounded-xl border border-accent p-6">
            <h3 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <span>🚀</span>
              Sources de trafic
            </h3>
            <div class="space-y-3">
              @for (source of analytics()?.trafficSources || []; track source.trafficSource) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">{{ getTrafficSourceIcon(source.trafficSource) }}</span>
                    <div>
                      <p class="font-medium text-text">{{ source.displayName }}</p>
                      <p class="text-sm text-secondary">{{ source.uniqueVisitors }} visiteurs</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-text">{{ source.visitCount }}</p>
                    <p class="text-sm text-secondary">{{ source.percentage.toFixed(1) }}%</p>
                  </div>
                </div>
              } @empty {
                <p class="text-secondary text-center py-4">Aucune donnée disponible</p>
              }
            </div>
          </div>

          <!-- Top Pages -->
          <div class="bg-background rounded-xl border border-accent p-6">
            <h3 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <span>📄</span>
              Pages populaires
            </h3>
            <div class="space-y-3">
              @for (page of analytics()?.topPages || []; track page.page) {
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-text truncate">
                      {{ getPageDisplayName(page.page) }}
                    </p>
                    <p class="text-sm text-secondary">
                      {{ page.uniqueVisitors }} visiteurs uniques
                    </p>
                  </div>
                  <div class="text-right ml-4">
                    <p class="font-bold text-text">{{ page.visitCount }}</p>
                    <p class="text-sm text-secondary">visites</p>
                  </div>
                </div>
              } @empty {
                <p class="text-secondary text-center py-4">Aucune donnée disponible</p>
              }
            </div>
          </div>
        </div>

        <!-- Timeline Chart -->
        <div class="bg-background rounded-xl border border-accent p-6">
          <div class="h-96">
            <app-timeline-chart
              [data]="analytics()?.timeline || []"
              [title]="'Évolution des visites sur 24h'"
            />
          </div>
        </div>
      }
    </div>
  `,
})
export class AnalyticsOverviewComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  readonly analytics = signal<AnalyticsOverview | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadRealTimeStats();
  }

  private async loadRealTimeStats(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.analyticsService.getRealTimeStats();
      this.analytics.set(data);
    } catch (error: unknown) {
      console.error('Erreur chargement analytics:', error);
      this.error.set(
        error instanceof Error ? error.message : 'Erreur lors du chargement des analytics',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  getTrafficSourceIcon(source: TrafficSource): string {
    const icons: Record<TrafficSource, string> = {
      DIRECT: '🔗',
      GOOGLE: '🔍',
      LINKEDIN: '💼',
      GITHUB: '⚡',
      TWITTER: '🐦',
      FACEBOOK: '📘',
      REFERRAL: '🔄',
      EMAIL: '📧',
      OTHER: '🌐',
    };
    return icons[source] || '🌐';
  }

  getPageDisplayName(page: string): string {
    if (!page || page === '/') return 'Accueil';

    const segments = page.split('/').filter(Boolean);
    if (segments.length === 0) return 'Accueil';

    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }
}
