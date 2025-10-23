import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CounterAdmin } from '@features/admin';
import { RecentActivityComponent } from '@features/admin';
import { ActivityChartComponent } from '@features/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CounterAdmin, RecentActivityComponent, ActivityChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <!-- Welcome Header -->
      <div class="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/40 p-6">
        <h2 class="text-2xl font-bold text-text mb-2">
          Bienvenue sur votre Dashboard 👋
        </h2>
        <p class="text-secondary">
          Gérez votre portfolio, consultez vos statistiques et administrez votre contenu.
        </p>
      </div>

      <!-- Métriques principales -->
      <section
        class="bg-background rounded-2xl border border-primary/40 p-6 shadow-lg shadow-primary/20 backdrop-blur"
      >
        <app-counter-admin />
      </section>

      <!-- Graphique d'activité -->
      <section
        class="bg-background rounded-2xl border border-primary/40 p-6 shadow-lg shadow-primary/20 backdrop-blur"
      >
        <app-activity-chart />
      </section>

      <!-- Activité récente -->
      <section
        class="bg-background rounded-2xl border border-primary/40 p-6 shadow-lg shadow-primary/20 backdrop-blur"
      >
        <app-recent-activity />
      </section>
    </div>
  `,
})
export class AdminDashboard {}
