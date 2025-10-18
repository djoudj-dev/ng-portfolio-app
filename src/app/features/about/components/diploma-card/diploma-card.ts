import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

interface DiplomaTooltip {
  readonly description: string;
  readonly skills: readonly string[];
}

export interface Diploma {
  readonly id: string;
  readonly title: string;
  readonly provider: string;
  readonly shortDescription: string;
  readonly tooltip: DiplomaTooltip;
}

@Component({
  selector: 'app-diploma-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group relative flex w-full flex-col gap-2 rounded-2xl border border-primary/25 bg-background p-3 text-left shadow-lg shadow-primary/15 transition hover:border-accent/40 hover:shadow-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-4 md:p-5 cursor-pointer"
      [class.z-0]="!isTooltipVisible()"
      [class.z-30]="isTooltipVisible()"
      tabindex="0"
      [attr.aria-describedby]="'diploma-tooltip-' + diploma().id"
      [attr.aria-expanded]="isTooltipVisible()"
      (click)="toggleTooltip()"
      (keydown.enter)="toggleTooltip()"
      (keydown.space)="toggleTooltip(); $event.preventDefault()"
      (mouseenter)="showTooltip()"
      (mouseleave)="hideTooltip()"
    >
      <header class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold uppercase tracking-250 text-primary/70">
          {{ diploma().title }}
        </h3>
        <p class="text-xs font-semibold uppercase tracking-200 text-accent/60">
          {{ diploma().provider }}
        </p>
      </header>
      <p class="text-sm text-text/80">
        {{ diploma().shortDescription }}
      </p>

      <div
        class="absolute left-1/2 top-full z-50 w-[calc(100vw-2rem)] max-w-80 -translate-x-1/2 translate-y-3 scale-95 rounded-2xl border border-primary/30 bg-background p-3 text-sm leading-relaxed text-text shadow-xl shadow-primary/25 transition-all duration-200 ease-out sm:p-4"
        [class.invisible]="!isTooltipVisible()"
        [class.visible]="isTooltipVisible()"
        [class.translate-y-0]="isTooltipVisible()"
        [class.scale-100]="isTooltipVisible()"
        role="tooltip"
        [attr.id]="'diploma-tooltip-' + diploma().id"
      >
        <p class="text-sm text-text/90">
          {{ diploma().tooltip.description }}
        </p>
        <div class="mt-3 border-t border-primary/20 pt-2">
          <span class="text-xs font-semibold uppercase tracking-200 text-accent/60">
            Compétences acquises
          </span>
          <ul class="mt-2 space-y-1 text-xs text-text/80">
            @for (skill of diploma().tooltip.skills; track skill) {
              <li>• {{ skill }}</li>
            }
          </ul>
        </div>
      </div>
    </article>
  `,
})
export class DiplomaCardComponent {
  readonly diploma = input.required<Diploma>();
  readonly isTooltipVisible = signal(false);

  toggleTooltip(): void {
    this.isTooltipVisible.update((visible) => !visible);
  }

  showTooltip(): void {
    this.isTooltipVisible.set(true);
  }

  hideTooltip(): void {
    this.isTooltipVisible.set(false);
  }
}
