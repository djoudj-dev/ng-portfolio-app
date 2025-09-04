import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { AnalyticsService } from '@features/analytics';
import type { AnalyticsOverview, TrafficSource } from '@features/analytics';

@Component({
  selector: 'app-analytics-overview',
  imports: [CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
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

        <div class="bg-background rounded-xl border border-accent p-6 shadow-lg">
          <div class="mb-6">
            <h3
              class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mb-2"
            >
              <img
                [ngSrc]="'/icons/stats.svg'"
                alt="Logo du CV"
                width="24"
                height="24"
                class="inline-block mr-2"
              />
              Évolution des visites
            </h3>
          </div>

          <div class="h-72 flex items-end justify-between gap-4 px-4 bg-background rounded-lg p-4">
            @for (day of chartData(); track day.label) {
              <div class="flex-1 flex flex-col items-center group cursor-pointer">
                <div class="relative w-full mb-3" style="height: 200px;">
                  <div class="absolute bottom-0 w-full flex flex-col justify-end">
                    <div
                      class="w-full bg-gradient-to-t from-accent-600 via-accent-500 to-accent-500 rounded-t-xl shadow-xl transition-all duration-500 ease-out hover:shadow-2xl hover:scale-110 cursor-pointer relative overflow-hidden"
                      [style.height.px]="day.visitHeight"
                      [title]="'📊 Visites totales: ' + day.visits"
                    >
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent -skew-x-12 animate-pulse rounded-t-xl"
                      ></div>

                      <div
                        class="absolute inset-0 bg-gradient-to-t from-primary-400/0 to-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl"
                      ></div>
                    </div>

                    <div
                      class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full border-2 border-background shadow-lg animate-bounce hover:animate-spin cursor-pointer"
                      [style.bottom.px]="day.uniqueHeight + 12"
                      [title]="'👤 Visiteurs uniques: ' + day.uniqueVisitors"
                    >
                      <div class="absolute inset-1 bg-background rounded-full opacity-30"></div>
                    </div>
                  </div>
                </div>

                <div class="text-center mb-3 space-y-2">
                  <div
                    class="text-text text-sm font-bold bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    🎯 {{ day.visits }}
                  </div>
                  <div
                    class="text-text text-xs font-semibold bg-gradient-to-r from-secondary-500 to-accent-500 px-3 py-1 rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    👥 {{ day.uniqueVisitors }}
                  </div>
                </div>

                <div
                  class="text-sm font-bold text-text group-hover:text-text transition-all duration-300 group-hover:scale-110"
                >
                  {{ day.label }}
                </div>
              </div>
            } @empty {
              <div class="flex-1 flex items-center justify-center text-gray-400">
                <div class="text-center space-y-4 animate-pulse">
                  <div class="text-8xl">📈</div>
                  <p class="text-xl font-bold text-gray-600">En attente de données...</p>
                </div>
              </div>
            }
          </div>

          <div class="mt-6 flex justify-center space-x-6">
            <div
              class="flex items-center space-x-3 bg-background px-6 py-3 rounded-full border border-accent hover:shadow-lg transition-shadow"
            >
              <div class="w-5 h-5 bg-accent rounded-full shadow-md animate-pulse"></div>
              <span class="text-sm font-semibold text-primary-700">📊 Visites totales</span>
            </div>
            <div
              class="flex items-center space-x-3 bg-background px-6 py-3 rounded-full border border-accent hover:shadow-lg transition-shadow"
            >
              <div class="w-5 h-5 bg-accent-800 rounded-full shadow-md animate-pulse"></div>
              <span class="text-sm font-semibold text-text">👤 Visiteurs uniques</span>
            </div>
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

    // Gérer les URLs complètes avec domaine
    if (page.startsWith('http://') || page.startsWith('https://')) {
      try {
        const url = new URL(page);
        const path = url.pathname;
        const search = url.search;

        // Pour l'accueil, retourner simplement "Accueil" sans le domaine
        if (path === '/' && !search) {
          return 'Accueil';
        }

        // Gérer les paramètres de requête
        if (search) {
          const params = new URLSearchParams(search);
          const paramDescriptions: string[] = [];

          if (params.has('page')) paramDescriptions.push(`Page ${params.get('page')}`);
          if (params.has('limit')) paramDescriptions.push(`${params.get('limit')} éléments`);
          if (params.has('sortBy')) {
            const sortBy = params.get('sortBy');
            const sortLabel = sortBy === 'createdAt' ? 'Date de création' : sortBy;
            paramDescriptions.push(`Trié par ${sortLabel}`);
          }
          if (params.has('sortOrder')) paramDescriptions.push(params.get('sortOrder') === 'desc' ? 'Décroissant' : 'Croissant');
          if (params.has('t')) paramDescriptions.push('Lien de suivi');

          const pathDescription = this.getPathDescription(path);
          const paramString = paramDescriptions.length > 0 ? ` (${paramDescriptions.join(', ')})` : '';

          return `${pathDescription}${paramString}`;
        }

        // Retourner seulement la description du chemin sans le domaine
        return this.getPathDescription(path);
      } catch {
        // Si l'URL n'est pas valide, continuer avec le traitement par défaut
      }
    }

    // Gérer les domaines sans protocole - retourner "Accueil" au lieu du domaine
    if (page.includes('.') && !page.includes('/') && !page.includes('?')) {
      return 'Accueil';
    }

    // Gérer les chemins locaux avec paramètres
    if (page.includes('?')) {
      const [path, search] = page.split('?');
      const params = new URLSearchParams(search);
      const paramDescriptions: string[] = [];

      if (params.has('page')) paramDescriptions.push(`Page ${params.get('page')}`);
      if (params.has('limit')) paramDescriptions.push(`${params.get('limit')} éléments`);
      if (params.has('sortBy')) {
        const sortBy = params.get('sortBy');
        const sortLabel = sortBy === 'createdAt' ? 'Date de création' : sortBy;
        paramDescriptions.push(`Trié par ${sortLabel}`);
      }
      if (params.has('sortOrder')) paramDescriptions.push(params.get('sortOrder') === 'desc' ? 'Décroissant' : 'Croissant');
      if (params.has('t')) paramDescriptions.push('Lien de suivi');

      const pathDescription = this.getPathDescription(path);
      const paramString = paramDescriptions.length > 0 ? ` (${paramDescriptions.join(', ')})` : '';

      return `${pathDescription}${paramString}`;
    }

    // Gérer les chemins simples
    return this.getPathDescription(page);
  }

  private getPathDescription(path: string): string {
    if (!path || path === '/') return 'Accueil';

    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'Accueil';

    // Mapping des chemins connus
    const pathMappings: Record<string, string> = {
      'about': 'À propos',
      'projects': 'Projets',
      'skills': 'Compétences',
      'contact': 'Contact',
      'admin': 'Administration',
      'dashboard': 'Tableau de bord',
      'cv': 'CV',
      'api': 'API',
      'login': 'Connexion',
      'register': 'Inscription',
      'profile': 'Profil'
    };

    // Utiliser le premier segment pour déterminer la section principale
    const mainSection = segments[0].toLowerCase();

    if (pathMappings[mainSection]) {
      if (segments.length === 1) {
        return pathMappings[mainSection];
      } else {
        // Pour les sous-sections, ajouter le contexte
        const subSection = segments.slice(1).join(' / ');
        return `${pathMappings[mainSection]} - ${subSection}`;
      }
    }

    // Pour les chemins non mappés, utiliser le dernier segment en le formatant
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/[-_]/g, ' ');
  }

  chartData() {
    const timeline = this.analytics()?.timeline ?? [];
    if (timeline.length === 0) return [];

    const last7Days = timeline.slice(-7);
    const maxVisits = Math.max(...last7Days.map((d) => d.visitCount));
    const maxHeight = 180;

    const uniqueDates = new Set(last7Days.map((d) => new Date(d.date).toDateString()));
    const hasIdenticalDates = uniqueDates.size === 1;

    if (hasIdenticalDates && last7Days.length > 0) {
      const today = new Date();
      return last7Days.map((day, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (last7Days.length - 1 - index));

        const visitHeight =
          maxVisits > 0 ? Math.max(20, (day.visitCount / maxVisits) * maxHeight) : 20;
        const uniqueHeight =
          maxVisits > 0 ? Math.max(15, (day.uniqueVisitors / maxVisits) * maxHeight) : 15;

        return {
          label: new Intl.DateTimeFormat('fr-FR', {
            weekday: 'short',
            day: 'numeric',
          }).format(date),
          visits: day.visitCount,
          uniqueVisitors: day.uniqueVisitors,
          visitHeight,
          uniqueHeight,
        };
      });
    }

    return last7Days.map((day) => {
      const visitHeight =
        maxVisits > 0 ? Math.max(20, (day.visitCount / maxVisits) * maxHeight) : 20;
      const uniqueHeight =
        maxVisits > 0 ? Math.max(15, (day.uniqueVisitors / maxVisits) * maxHeight) : 15;

      return {
        label: new Intl.DateTimeFormat('fr-FR', {
          weekday: 'short',
          day: 'numeric',
        }).format(new Date(day.date)),
        visits: day.visitCount,
        uniqueVisitors: day.uniqueVisitors,
        visitHeight,
        uniqueHeight,
      };
    });
  }
}
