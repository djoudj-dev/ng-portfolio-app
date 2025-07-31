import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MindsetData } from './interface/mindset-data';
import { MINDSET } from './data/mindset-data';

@Component({
  selector: 'app-about-card-mindset',
  imports: [NgOptimizedImage],
  template: `
    <section aria-labelledby="mindset-heading">
      <h2
        id="mindset-heading"
        class="text-accent decoration-text mb-4 text-2xl font-semibold underline"
      >
        Mon approche
      </h2>
      <ul class="m-0 grid list-none grid-cols-1 gap-4 p-0 lg:grid-cols-2">
        @for (card of mindsetData(); track card.id) {
          <li
            class="bg-background shadow-text border-accent ase-in-out transform rounded-lg border p-4 hover:scale-105 hover:shadow-md hover:transition-all hover:duration-300 hover:ease-in-out"
          >
            <article>
              <header class="flex items-center gap-2">
                <img
                  [ngSrc]="card.icon"
                  [alt]="'Icône ' + card.label"
                  class="icon-invert h-6 w-6"
                  width="24"
                  height="24"
                />
                <h3 class="text-accent mt-2 mb-2 text-lg font-semibold">
                  {{ card.label }}
                </h3>
              </header>
              <p class="text-text max-w-xs text-sm">{{ card.description }}</p>
            </article>
          </li>
        }
      </ul>
    </section>
  `,
})
export class AboutCardMindset {
  readonly mindsetData = signal<MindsetData[]>(MINDSET);
}
