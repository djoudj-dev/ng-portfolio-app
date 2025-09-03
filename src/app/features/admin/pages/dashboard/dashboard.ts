import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsOverviewComponent } from '@features/analytics';
import { CounterAdmin } from '@features/admin/components/counter-admin';
import { RecentActivityComponent } from '@features/admin/components/recent-activity';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, CounterAdmin, RecentActivityComponent, AnalyticsOverviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto p-6 space-y-8">
      <!-- Stats Cards -->
      <div>
        <section class="flex flex-row items-center justify-center">
          <app-counter-admin />
        </section>
      </div>

      <!-- Analytics Overview Section -->
      <section class="bg-background rounded-2xl border border-accent shadow-sm p-6">
        <app-analytics-overview />
      </section>

      <!-- Enhanced Activity Section -->
      <section class="bg-background rounded-2xl border border-accent shadow-sm">
        <app-recent-activity />
      </section>
    </div>
  `,
})
export class AdminDashboard {}
