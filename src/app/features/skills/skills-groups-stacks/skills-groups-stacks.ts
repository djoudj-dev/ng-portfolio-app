import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SkillCategoryData } from '../interface/skill-data';
import { SKILL_CATEGORIES } from '../data/skill-data';

@Component({
  selector: 'app-skills-groups-stacks',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3"
      aria-label="Compétences techniques par catégorie"
    >
      @for (category of skillCategories(); track category.id) {
        <article
          class="bg-background border-accent rounded-xl border p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <!-- Header avec icon et titre optimisé mobile -->
          <div class="mb-4 sm:mb-6">
            <div class="flex items-center gap-3 mb-3">
              @if (category.id === 'frontend') {
                <div class="flex-shrink-0 p-2">
                  <img
                    [ngSrc]="'/icons/frontend.svg'"
                    alt="Icône développement frontend"
                    width="24"
                    height="24"
                    class="icon-invert h-6 w-6"
                  />
                </div>
              } @else if (category.id === 'backend') {
                <div class="flex-shrink-0 p-2">
                  <img
                    [ngSrc]="'/icons/backend.svg'"
                    alt="Icône développement backend"
                    width="24"
                    height="24"
                    class="icon-invert h-6 w-6"
                  />
                </div>
              } @else if (category.id === 'tools') {
                <div class="flex-shrink-0 p-2">
                  <img
                    [ngSrc]="'/icons/devops.svg'"
                    alt="Icône outils de développement"
                    width="24"
                    height="24"
                    class="icon-invert h-6 w-6"
                  />
                </div>
              }
              <h2
                id="{{ category.id }}-section"
                class="text-text text-lg sm:text-xl lg:text-2xl font-bold"
              >
                {{ category.title }}
              </h2>
            </div>
            <div class="h-0.5 bg-gradient-to-r from-accent to-transparent rounded-full"></div>
          </div>

          <!-- Grille de badges skills responsive -->
          <ul
            class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3"
            [attr.aria-labelledby]="category.id + '-section'"
          >
            @for (skill of category.skills; track skill.id) {
              <li
                class="group flex items-center gap-2 sm:gap-3 border border-accent/60 rounded-lg bg-background hover:bg-accent/10 hover:border-accent hover:shadow-sm p-2.5 sm:p-3 min-w-0 transition-all duration-200 cursor-pointer"
              >
                <div class="flex-shrink-0">
                  <img
                    [ngSrc]="skill.icon"
                    [alt]="'Logo ' + skill.title"
                    width="24"
                    height="24"
                    class="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <h3
                  class="text-xs sm:text-sm font-medium text-text truncate min-w-0 group-hover:text-accent transition-colors"
                >
                  {{ skill.title }}
                </h3>
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
