import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SkillsCertification } from './skills-certification/skills-certification';
import { SkillsGroupsStacks } from './skills-groups-stacks/skills-groups-stacks';

@Component({
  selector: 'app-skills',
  imports: [SkillsCertification, SkillsGroupsStacks],
  templateUrl: './skills.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skills {
  readonly skillsTitle = signal('Mes compétences');
  readonly skillsSubTitle = signal(
    'Découvrez mon expertise technique et mes certifications dans le développement web moderne.',
  );
}
