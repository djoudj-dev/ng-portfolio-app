import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DiplomaCardComponent, type Diploma } from './diploma-card';

@Component({
  selector: 'app-diplomas-section',
  imports: [DiplomaCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (diplomas().length > 0) {
      <section class="flex flex-col gap-4">
        <h2 class="text-lg font-semibold uppercase tracking-280 text-accent/60">Formations</h2>
        <div class="flex flex-col gap-4">
          @for (diploma of diplomas(); track diploma.id) {
            <app-diploma-card [diploma]="diploma" />
          }
        </div>
      </section>
    }
  `,
})
export class DiplomasSectionComponent {
  readonly diplomas = input.required<readonly Diploma[]>();
}
