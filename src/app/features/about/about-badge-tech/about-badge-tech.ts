import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { BadgeTechData } from './interface/badge-tech-data';
import { DATA_BADGE_TECH } from './data/data-badge-tech';

@Component({
  selector: 'app-about-badge-tech',
  imports: [NgOptimizedImage],
  template: `
    <section class="p-2 lg:w-auto" aria-labelledby="tech-skills-heading">
      <h3
        id="tech-skills-heading"
        class="text-accent sr-only mb-2 text-lg font-semibold"
      >
        Compétences techniques
      </h3>
      <ul class="m-0 grid list-none grid-cols-2 gap-2 p-0 lg:grid-cols-1">
        @for (tech of techBadges(); track tech.id) {
          <li
            class="bg-background shadow-text border-accent flex items-center gap-2 rounded-lg border p-2 hover:scale-105 hover:shadow-md hover:transition-all hover:duration-300 hover:ease-in-out"
          >
            <img
              class="h-6 w-6"
              [ngSrc]="tech.icon"
              [alt]="'Icône ' + tech.label"
              [title]="tech.label"
              width="24"
              height="24"
            />
            <span class="text-accent text-sm font-bold">{{ tech.label }}</span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class AboutBadgeTech {
  readonly techBadges = signal<BadgeTechData[]>(DATA_BADGE_TECH);
}
