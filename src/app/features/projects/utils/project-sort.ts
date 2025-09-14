import { ProjectModel } from '@features/projects/models/project-model';

export function compareProjectsByPriority(a: ProjectModel, b: ProjectModel): number {
  const priorityA = a.priority ?? Number.POSITIVE_INFINITY;
  const priorityB = b.priority ?? Number.POSITIVE_INFINITY;

  return priorityA !== priorityB ? priorityA - priorityB : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function sortProjectsByPriority<T extends ProjectModel>(list: readonly T[]): T[] {
  return [...list].sort(compareProjectsByPriority);
}
