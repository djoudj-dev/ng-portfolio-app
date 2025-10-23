import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashBar } from '@features/admin/core';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, DashBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-background">
      <!-- DashBar Navigation -->
      <app-dash-bar />

      <!-- Main Content Area -->
      <main class="min-h-[calc(100vh-4rem)]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <router-outlet />
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-primary/20 bg-background/80 backdrop-blur-sm shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p class="text-xs text-text/60 text-center font-medium">
            © {{ currentYear }} Dashboard Admin · Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  `,
})
export class AdminLayout {
  protected readonly currentYear = new Date().getFullYear();
}
