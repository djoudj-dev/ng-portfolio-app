import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CounterAdmin } from '@features/admin';
import { RecentActivityComponent } from '@features/admin';
import { ActivityChartComponent } from '@features/admin/features/analytics';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CounterAdmin, RecentActivityComponent, ActivityChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Test simple -->
      <div class="p-4 bg-green-500 text-white font-bold">
        Dashboard chargé avec succès !
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
