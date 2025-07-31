import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ABOUT_HERO_DATA } from './data/about-hero-data';

@Component({
  selector: 'app-about-hero',
  imports: [],
  template: `
    <article>
      <h2
        class="text-accent decoration-text mb-3 text-2xl font-semibold underline"
      >
        {{ aboutHeroData.title }}
      </h2>
      <div class="content">
        <p class="mb-4 text-lg leading-relaxed">
          {{ aboutHeroData.text }}
        </p>

        <p class="mb-6 text-lg leading-relaxed">
          {{ aboutHeroData.textBis }}
        </p>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutHero {
  aboutHeroData = ABOUT_HERO_DATA;
}
