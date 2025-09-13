import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardData } from '@features/about/interface/card-data';

@Component({
  selector: 'app-about-card',
  imports: [NgOptimizedImage],
  template: `
    <div class="mt-16 sm:mt-20 lg:mt-0">
      <h3
        class=" pb-4 text-2xl font-bold text-center sm:text-3xl lg:text-4xl underline underline-offset-4 decoration-accent decoration-3"
      >
        Mes valeurs
      </h3>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 auto-rows-fr">
        @for (card of cards(); track card.icon) {
          <div class="group">
            <article
              class="flex flex-col p-6 bg-background border border-accent rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 min-h-[180px] h-full transition-all duration-300"
            >
              <!-- En-tête avec icône et titre -->
              <div class="flex items-center mb-3 gap-3">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-accent/40 group-hover:bg-accent transition-colors duration-300 flex-shrink-0"
                >
                  <img
                    [ngSrc]="'/icons/' + card.icon + '.svg'"
                    [alt]="'Icône ' + card.title"
                    class="object-contain w-6 h-6 icon-invert"
                    width="24"
                    height="24"
                  />
                </div>
                <p class="text-lg font-semibold text-text group-hover:text-accent">
                  {{ card.title }}
                </p>
              </div>

              <!-- Description -->
              <p class="text-sm leading-relaxed text-text/80 flex-1">
                {{ card.description }}
              </p>
            </article>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutCard {
  readonly cards = input.required<CardData[]>();
}
