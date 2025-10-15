import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';
import { TypewriterComponent } from '../typewriter/typewriter';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonComponent, SvgIcon, TypewriterComponent],
  templateUrl: './hero-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  private readonly router = inject(Router);

  private readonly defaultDisplayName = 'Julien NÉDELLEC';
  private readonly defaultHeroDescription =
    "Je crée des applications web modernes, performantes et accessibles. J'aime me spécialiser dans le développement frontend avec Angular mais aussi dans la partie backend selon les besoins.";

  readonly displayName = computed(() => this.defaultDisplayName);
  readonly description = computed(() => this.defaultHeroDescription);

  navigateTo(path: string): void {
    void this.router.navigate(['/', path]);
  }
}
