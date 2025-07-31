export interface SkillCategoryData {
  id: string;
  title: string;
  skills: SkillData[];
}

export interface SkillData {
  id: string;
  title: string;
  icon: string;
}

export interface CertificationData {
  id: string;
  title: string;
  description: string;
  status: string;
  year?: string;
  skillsLearned?: string[];
}
