import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-admin-settings',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center space-y-6 max-w-md">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
          <app-svg-icon
            name="lucide:construction"
            class="w-12 h-12 text-primary"
            width="48"
            height="48"
          />
        </div>

        <div class="space-y-2">
          <h2 class="text-3xl font-bold text-text">En construction</h2>
          <p class="text-secondary text-lg">
            Cette section est en cours de développement.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <app-svg-icon
            name="lucide:clock"
            class="w-5 h-5 text-primary"
            width="20"
            height="20"
          />
          <span class="text-sm font-medium text-primary">Disponible prochainement</span>
        </div>
      </div>
    </div>
  `,
})
export class AdminSettingsPage {}
