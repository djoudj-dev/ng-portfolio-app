import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { HighlightCardComponent, type Highlight } from '../highlight-card/highlight-card';

@Component({
  selector: 'app-highlights-section',
  imports: [HighlightCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (highlights().length > 0) {
      <section class="grid gap-4 sm:grid-cols-2" aria-label="Points forts">
        @for (highlight of highlights(); track highlight.title; let index = $index) {
          <app-highlight-card [highlight]="highlight" [index]="index" />
        }
      </section>
    }
  `,
})
export class HighlightsSectionComponent {
  readonly highlights = input.required<readonly Highlight[]>();
}
