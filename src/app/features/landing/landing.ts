import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSection } from '@features/landing/hero-section/hero-section';
import { BadgeDisplayComponent } from '@features/badge/components/badge-display';

@Component({
  selector: 'app-landing',
  imports: [HeroSection, BadgeDisplayComponent],
  template: `
    <main class="pt-24">
      <!-- Badge Status centré en haut de page -->
      <div class="fixed top-15 left-1/2 transform -translate-x-1/2 z-40">
        <app-badge-display />
      </div>

      <app-hero-section />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}
