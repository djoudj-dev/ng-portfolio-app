import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HeroSection } from "@features/landing/hero-section/hero-section";
import { CardBadge } from "@features/landing/badge/components/card-badge/card-badge";
import { About } from "@features/about/about";
import { Skills } from "@features/skills/skills";
import { Project } from "@features/projects/project";
import { Contact } from "@features/contact/contact";

@Component({
  selector: "app-landing",
  imports: [CardBadge, HeroSection, About, Skills, Project, Contact],
  template: `
    <main id="home" class="bg-background">
      <app-card-badge />
      <app-hero-section />
      <app-about />
      <app-skills />
      <app-project />
      <app-contact />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}
