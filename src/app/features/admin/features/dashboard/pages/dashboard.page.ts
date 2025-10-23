import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CounterAdmin } from '@features/admin';
import { RecentActivityComponent } from '@features/admin';
import { ActivityChartComponent } from '@features/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CounterAdmin, RecentActivityComponent, ActivityChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Welcome Header -->
      <div class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl border border-accent shadow-xl shadow-primary/10 p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group">
        <div class="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              <span class="text-2xl">👋</span>
            </div>
            <h2 class="text-3xl font-bold text-text">
              Bienvenue sur votre Dashboard
            </h2>
          </div>
          <p class="text-secondary text-lg">
            Gérez votre portfolio, consultez vos statistiques et administrez votre contenu en temps réel.
          </p>
        </div>
      </div>

      <!-- Métriques principales -->
      <section
        class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 p-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center border border-accent">
            <span class="text-xl">📊</span>
          </div>
          <h3 class="text-xl font-bold text-text">Métriques & Statistiques</h3>
        </div>
        <app-counter-admin />
      </section>

      <!-- Graphique d'activité -->
      <section
        class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1"
      >
        <app-activity-chart />
      </section>

      <!-- Activité récente -->
      <section
        class="bg-background/80 backdrop-blur-xl rounded-2xl border border-accent shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1"
      >
        <app-recent-activity />
      </section>
    </div>
  `,
})
export class AdminDashboard {}
