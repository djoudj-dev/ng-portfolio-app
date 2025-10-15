import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';

export interface Highlight {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

@Component({
  selector: 'app-highlight-card',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group relative flex items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-background/85 via-background/60 to-primary/10 px-3 py-3 text-left shadow-md shadow-primary/15 transition hover:border-accent/40 hover:shadow-accent/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:gap-4 sm:px-4 md:px-5 md:py-4"
      tabindex="0"
      [attr.aria-describedby]="'highlight-tooltip-' + index()"
    >
      <span
        class="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/30 via-background/50 to-primary/20 text-text"
        aria-hidden="true"
      >
        <app-svg-icon [name]="highlight().icon" [width]="'24'" [height]="'24'" />
      </span>
      <div class="flex flex-col">
        <h2 class="text-sm font-semibold uppercase tracking-200 text-primary/70">
          {{ highlight().title }}
        </h2>
        <p class="text-xs uppercase tracking-150 text-accent/60">
          Survolez pour en savoir plus
        </p>
      </div>

      <div
        class="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 -translate-x-1/2 rounded-2xl border border-primary/30 bg-background/95 p-3 text-sm leading-relaxed text-text opacity-0 shadow-xl shadow-primary/25 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:p-4"
        role="tooltip"
        [attr.id]="'highlight-tooltip-' + index()"
      >
        {{ highlight().description }}
      </div>
    </article>
  `,
})
export class HighlightCardComponent {
  readonly highlight = input.required<Highlight>();
  readonly index = input.required<number>();
}
