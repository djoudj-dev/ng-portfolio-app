import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { SkillsCertification } from "./skills-certification/skills-certification";
import { SkillsGroupsStacks } from "./skills-groups-stacks/skills-groups-stacks";

@Component({
  selector: "app-skills",
  imports: [SkillsCertification, SkillsGroupsStacks, NgOptimizedImage],
  templateUrl: "./skills.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  private readonly router = inject(Router);

  readonly skillsTitle = signal("Mes compétences");
  readonly skillsSubTitle = signal(
    "Découvrez mon expertise technique et mes certifications dans le développement web moderne.",
  );

  navigateToProjects(): void {
    this.router.navigate(["/projects"]);
  }
}
