import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSection } from '@features/landing/hero-section/hero-section';

@Component({
  selector: 'app-landing',
  imports: [HeroSection],
  template: `
    <main class="pt-24">
      <app-hero-section />
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {}
