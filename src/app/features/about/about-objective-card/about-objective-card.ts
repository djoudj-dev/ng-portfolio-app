import { Component } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { OBJECTIVE_DATA } from "./data/objective-data";

@Component({
  selector: "app-about-objective-card",
  imports: [NgOptimizedImage],
  template: `
    <article aria-labelledby="objective-heading">
      <header class="mb-2 flex items-center gap-2">
        <img
          [ngSrc]="objectiveData.icon"
          alt="Icône d'objectif professionnel"
          class="icon-invert h-6 w-6"
          width="24"
          height="24"
        />
        <h2
          id="objective-heading"
          class="text-accent decoration-accent text-xl font-semibold"
        >
          {{ objectiveData.title }}
        </h2>
      </header>
      <div class="content">
        <p class="text-text/90 mb-8 text-base">
          {{ objectiveData.text }}
        </p>
        <p class="text-text/90 text-base">
          {{ objectiveData.textBis }}
        </p>
      </div>
    </article>
  `,
})
export class AboutObjectiveCard {
  objectiveData = OBJECTIVE_DATA;
}
