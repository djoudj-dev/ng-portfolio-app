import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSection } from '@features/landing/hero-section/hero-section';

@Component({
  selector: 'app-landing',
  imports: [HeroSection],
  template: `
    <main class="min-h-screen pt-20 sm:pt-18 md:pt-20">
      <app-hero-section />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}
