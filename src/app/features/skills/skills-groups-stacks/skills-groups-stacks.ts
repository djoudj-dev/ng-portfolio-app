import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { SkillCategoryData } from '../interface/skill-data';
import { SKILL_CATEGORIES } from '../data/skill-data';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-skills-groups-stacks',
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="flex flex-col gap-4 sm:gap-5 md:gap-6"
      aria-label="Compétences techniques par catégorie"
    >
      @for (category of skillCategories(); track category.id; let idx = $index) {
        <article
          class="group/card rounded-2xl border border-primary/25 bg-gradient-to-br from-background/80 via-background/60 to-primary/10 p-3 sm:p-4 md:p-5 shadow-lg shadow-primary/15 transition-all duration-300 hover:border-accent/40 hover:shadow-accent/30 hover:-translate-y-1"
          [style.animation-delay]="idx * 100 + 'ms'"
        >
          <!-- Header avec icon et titre modernisé -->
          <div class="mb-4 sm:mb-5">
            <div class="flex items-center gap-3 sm:gap-4 mb-3">
              @if (category.id === 'frontend') {
                <div
                  class="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/30 via-background/50 to-primary/20 transition-colors group-hover/card:border-accent/60"
                >
                  <app-svg-icon
                    name="material-symbols-light:laptop-mac-outline-sharp"
                    [width]="'24'"
                    [height]="'24'"
                    class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
                  />
                </div>
              } @else if (category.id === 'backend') {
                <div
                  class="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/30 via-background/50 to-primary/20 transition-colors group-hover/card:border-accent/60"
                >
                  <app-svg-icon
                    name="material-symbols-light:data-table"
                    [width]="'24'"
                    [height]="'24'"
                    class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
                  />
                </div>
              } @else if (category.id === 'tools') {
                <div
                  class="flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-gradient-to-br from-accent/30 via-background/50 to-primary/20 transition-colors group-hover/card:border-accent/60"
                >
                  <app-svg-icon
                    name="ic:sharp-terminal"
                    [width]="'24'"
                    [height]="'24'"
                    class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
                  />
                </div>
              }
              <div class="flex-1">
                <h2
                  id="{{ category.id }}-section"
                  class="text-primary/70 text-base sm:text-lg lg:text-xl font-bold group-hover/card:text-accent transition-colors uppercase tracking-250"
                >
                  {{ category.title }}
                </h2>
                <div
                  class="h-0.5 bg-gradient-to-r from-accent/60 via-primary/30 to-transparent rounded-full mt-2 max-w-[80%]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Grille de badges skills modernisée -->
          <ul
            class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3"
            [attr.aria-labelledby]="category.id + '-section'"
          >
            @for (skill of category.skills; track skill.id; let skillIdx = $index) {
              <li [style.animation-delay]="skillIdx * 50 + 'ms'">
                @if (skill.url) {
                  <a
                    [href]="skill.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="group/skill flex items-center gap-2 sm:gap-2.5 border border-primary/25 rounded-xl bg-gradient-to-br from-background/85 via-background/60 to-primary/10 hover:border-accent/40 hover:shadow-md hover:shadow-accent/25 p-2 sm:p-2.5 min-w-0 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                    [attr.aria-label]="'Voir la documentation de ' + skill.title"
                  >
                    <div
                      class="flex-shrink-0 transition-transform group-hover/skill:scale-110 duration-300"
                    >
                      <app-svg-icon
                        [name]="skill.icon"
                        [width]="'24'"
                        [height]="'24'"
                        class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
                      />
                    </div>
                    <h3
                      class="text-xs sm:text-sm font-semibold text-primary/70 truncate min-w-0 group-hover/skill:text-accent transition-colors uppercase tracking-150"
                    >
                      {{ skill.title }}
                    </h3>
                  </a>
                } @else {
                  <div
                    class="group/skill flex items-center gap-2 sm:gap-2.5 border border-primary/25 rounded-xl bg-gradient-to-br from-background/85 via-background/60 to-primary/10 p-2 sm:p-2.5 min-w-0 transition-all duration-300"
                  >
                    <div class="flex-shrink-0">
                      <app-svg-icon
                        [name]="skill.icon"
                        [width]="'24'"
                        [height]="'24'"
                        class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
                      />
                    </div>
                    <h3
                      class="text-xs sm:text-sm font-semibold text-primary/70 truncate min-w-0 uppercase tracking-150"
                    >
                      {{ skill.title }}
                    </h3>
                  </div>
                }
              </li>
            }
          </ul>
        </article>
      }
    </section>
  `,
})
export class SkillsGroupsStacks {
  readonly skillCategories = signal<SkillCategoryData[]>(SKILL_CATEGORIES);
}
