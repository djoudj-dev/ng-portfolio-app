import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CounterAdmin } from '@features/admin/components/counter-admin';
import { RecentActivityComponent } from '@features/admin/components/recent-activity';
import { ActivityChartComponent } from '@features/analytics';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, CounterAdmin, RecentActivityComponent, ActivityChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-8">
      <!-- Métriques principales -->
      <section>
        <app-counter-admin />
      </section>

      <!-- Graphique d'activité -->
      <section>
        <app-activity-chart />
      </section>

      <!-- Activité récente -->
      <section class="bg-background rounded-2xl border border-accent shadow-sm">
        <app-recent-activity />
      </section>
    </div>
  `,
})
export class AdminDashboard {}
