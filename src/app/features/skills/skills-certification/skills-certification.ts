import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CERTIFICATIONS } from '../data/skill-data';
import { type CertificationData } from '../interface/skill-data';
import { ButtonComponent } from '@shared/ui/button/button';
import { SvgIcon } from '@app/shared/ui/icon-svg/icon-svg';

@Component({
  selector: 'app-skills-certification',
  imports: [ButtonComponent, SvgIcon],
  templateUrl: './skills-certification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsCertification {
  readonly certifications: readonly CertificationData[] = CERTIFICATIONS;
  readonly certificationSlides = signal<Record<string, number>>({});

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
