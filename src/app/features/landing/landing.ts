import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HeroSection } from "@features/landing/hero-section/hero-section";
import { CardBadge } from "@features/landing/badge/components/card-badge/card-badge";

@Component({
  selector: "app-landing",
  imports: [CardBadge, HeroSection],
  template: `
    <main>
      <div id="home">
        <app-card-badge />
      </div>
      <app-hero-section />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}
