import { ProjectFilter } from '@features/projects/models/project-model';
import { ProjectCategory } from '@features/projects/enums/project-enum';

export const PROJECT_FILTERS: ProjectFilter[] = [
  { label: 'Tous', value: 'all', active: true },
  { label: 'Frontend', value: ProjectCategory.FRONTEND, active: false },
  { label: 'Backend', value: ProjectCategory.BACKEND, active: false },
  { label: 'Fullstack', value: ProjectCategory.FULLSTACK, active: false },
  { label: 'Script', value: ProjectCategory.SCRIPT, active: false },
];
