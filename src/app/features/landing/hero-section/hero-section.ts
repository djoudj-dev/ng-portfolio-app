import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button';
import { SvgIcon } from '@shared/ui/icon-svg/icon-svg';
import { TypewriterComponent } from '../typewriter/typewriter';

@Component({
  selector: 'app-hero-section',
  imports: [ButtonComponent, SvgIcon, TypewriterComponent],
  templateUrl: './hero-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  private readonly router = inject(Router);

  readonly displayName =
    'Julien NÉDELLEC';
  readonly description =
    "Je crée des applications web modernes, performantes et accessibles. J'aime me spécialiser dans le développement frontend avec Angular mais aussi dans la partie backend selon les besoins.";

  navigateTo(path: string): void {
    void this.router.navigate(['/', path]);
  }
}
