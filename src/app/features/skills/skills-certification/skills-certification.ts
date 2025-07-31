import { NgOptimizedImage } from "@angular/common";
import { Component, effect, signal } from "@angular/core";
import { CERTIFICATIONS } from "../data/skill-data";
import { CertificationData } from "../interface/skill-data";
import { ButtonComponent } from "@shared/ui/button/button";

@Component({
  selector: "app-skills-certification",
  imports: [NgOptimizedImage, ButtonComponent],
  template: `
    <section class="px-4 py-6 sm:px-6" aria-labelledby="certifications-section">
      <h2
        id="certifications-section"
        class="text-accent decoration-text mb-6 text-center text-xl font-bold underline sm:text-2xl"
      >
        Certifications
      </h2>

      <div
        class="mx-auto grid max-w-md grid-cols-1 gap-4 sm:max-w-2xl sm:gap-6 md:max-w-4xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-2"
        role="list"
      >
        @for (certification of certifications(); track certification.id) {
          <article
            class="bg-background shadow-text border-accent relative rounded-lg border p-4 hover:scale-105 hover:shadow-md hover:transition-all hover:duration-300 hover:ease-in-out"
            role="article"
          >
            <header class="mb-3 flex items-center gap-2 sm:mb-4">
              <img
                [ngSrc]="'icons/student.svg'"
                alt="Icône de certification"
                width="20"
                height="20"
                class="icon-invert h-5 w-5 sm:h-6 sm:w-6"
              />
              <h3
                class="decoration-accent text-lg font-semibold underline sm:text-xl"
                id="certification-{{ certification.id }}"
              >
                {{ certification.title }}
              </h3>
            </header>

            <!-- Slide container -->
            <div
              class="relative mt-3 min-h-[180px] overflow-hidden sm:mt-4 sm:min-h-[200px]"
              [attr.aria-labelledby]="'certification-' + certification.id"
            >
              <!-- Slide 1 : Description -->
              <section
                class="absolute inset-0 w-full transition-all duration-300 ease-in-out"
                [class.transform]="getCurrentSlide(certification.id) !== 0"
                [class.translate-x-0]="getCurrentSlide(certification.id) === 0"
                [class.-translate-x-full]="
                  getCurrentSlide(certification.id) !== 0
                "
                [class.opacity-100]="getCurrentSlide(certification.id) === 0"
                [class.opacity-0]="getCurrentSlide(certification.id) !== 0"
                [attr.aria-hidden]="getCurrentSlide(certification.id) !== 0"
                id="certification-{{ certification.id }}-description"
              >
                <p class="text-text text-xs sm:text-lg">
                  {{ certification.description }}
                </p>
              </section>

              <!-- Slide 2 : Compétences -->
              <section
                class="absolute inset-0 w-full transition-all duration-300 ease-in-out"
                [class.transform]="getCurrentSlide(certification.id) !== 1"
                [class.translate-x-0]="getCurrentSlide(certification.id) === 1"
                [class.translate-x-full]="
                  getCurrentSlide(certification.id) !== 1
                "
                [class.opacity-100]="getCurrentSlide(certification.id) === 1"
                [class.opacity-0]="getCurrentSlide(certification.id) !== 1"
                [attr.aria-hidden]="getCurrentSlide(certification.id) !== 1"
              >
                <h4
                  class="mb-2 text-base font-semibold sm:text-lg"
                  id="skills-{{ certification.id }}"
                >
                  Compétences acquises :
                </h4>
                <ul
                  class="list-disc space-y-1 pl-4 text-xs sm:pl-5 sm:text-base"
                  [attr.aria-labelledby]="'skills-' + certification.id"
                >
                  @for (skill of certification.skillsLearned; track skill) {
                    <li class="text-text/70">{{ skill }}</li>
                  }
                </ul>
              </section>
            </div>

            <!-- Footer -->
            <footer
              class="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-center gap-2">
                <img
                  [ngSrc]="'icons/trophy.svg'"
                  alt="Icône de trophée"
                  width="20"
                  height="20"
                  class="h-6 w-6 sm:h-8 sm:w-8"
                />
                <p class="text-text/70 text-sm font-bold sm:text-lg">
                  {{ certification.status }}
                </p>
              </div>

              <!-- Navigation buttons -->
              <nav
                class="flex gap-2"
                aria-label="Navigation des détails de certification"
              >
                <app-button
                  [color]="
                    getCurrentSlide(certification.id) === 0
                      ? 'secondary'
                      : 'accent'
                  "
                  [customClass]="
                    'flex-1 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm'
                  "
                  (buttonClick)="goToSlide(certification.id, 0)"
                  [attr.aria-pressed]="getCurrentSlide(certification.id) === 0"
                  [attr.aria-controls]="
                    'certification-' + certification.id + '-description'
                  "
                >
                  Description
                </app-button>
                <app-button
                  [color]="
                    getCurrentSlide(certification.id) === 1
                      ? 'secondary'
                      : 'accent'
                  "
                  [customClass]="
                    'flex-1 px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm'
                  "
                  (buttonClick)="goToSlide(certification.id, 1)"
                  [attr.aria-pressed]="getCurrentSlide(certification.id) === 1"
                  [attr.aria-controls]="'skills-' + certification.id"
                >
                  Compétences
                </app-button>
              </nav>
            </footer>
          </article>
        }
      </div>
    </section>
  `,
})
export class SkillsCertification {
  readonly certifications = signal<CertificationData[]>(CERTIFICATIONS);
  readonly certificationSlides = signal<Record<string, number>>({});

  constructor() {
    effect(() => {
      const initialState: Record<string, number> = {};
      this.certifications().forEach((cert) => {
        initialState[cert.id] = 0;
      });
      this.certificationSlides.set(initialState);
    });
  }

  goToSlide(certificationId: string, slideIndex: number): void {
    this.certificationSlides.update((slides) => {
      const newSlides = { ...slides };
      newSlides[certificationId] = slideIndex;
      return newSlides;
    });
  }

  getCurrentSlide(certificationId: string): number {
    return this.certificationSlides()[certificationId] ?? 0;
  }
}
