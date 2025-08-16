import { Component, signal } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { SkillCategoryData } from "../interface/skill-data";
import { SKILL_CATEGORIES } from "../data/skill-data";
import { HoverClassBehaviorDirective } from "@shared/behaviors/hover-class";

@Component({
  selector: "app-skills-groups-stacks",
  imports: [NgOptimizedImage, HoverClassBehaviorDirective],
  template: `
    <section
      class="grid grid-cols-1 gap-6 md:grid-cols-3"
      aria-label="Compétences techniques par catégorie"
    >
      @for (category of skillCategories(); track category.id) {
        <article
          class="bg-background shadow-text border-accent rounded-lg border p-6"
          appHoverClass
        >
          <div class="mb-4 flex items-center gap-2">
            @if (category.id === "frontend") {
              <img
                [ngSrc]="'/icons/frontend.svg'"
                alt="Icône développement frontend"
                width="24"
                height="24"
                class="icon-invert h-6 w-6"
              />
            } @else if (category.id === "backend") {
              <img
                [ngSrc]="'/icons/backend.svg'"
                alt="Icône développement backend"
                width="24"
                height="24"
                class="icon-invert h-6 w-6"
              />
            } @else if (category.id === "tools") {
              <img
                [ngSrc]="'/icons/devops.svg'"
                alt="Icône outils de développement"
                width="24"
                height="24"
                class="icon-invert h-6 w-6"
              />
            }
            <h2
              id="{{ category.id }}-section"
              class="text-text decoration-accent text-2xl font-bold underline"
            >
              {{ category.title }}
            </h2>
          </div>
          <ul
            class="space-y-4"
            [attr.aria-labelledby]="category.id + '-section'"
          >
            @for (skill of category.skills; track skill.id) {
              <li class="flex items-center gap-2">
                <img
                  [ngSrc]="skill.icon"
                  [alt]="'Logo ' + skill.title"
                  width="24"
                  height="24"
                  class="h-6 w-6"
                />
                <h3 class="text-xld">{{ skill.title }}</h3>
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
