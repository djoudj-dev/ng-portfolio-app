import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { ProjectData, ProjectCategory, GithubUrls } from '@features/projects/interface/project-data';

// Type pour les données brutes du formulaire (peut contenir des null pour les champs optionnels)
export interface ProjectFormValue {
  title: string | null;
  description: string | null;
  technologies: string[] | null;
  demo_url: string | null;
  category: ProjectCategory | null;
  featured: boolean | null;
  date: string | null;
  github_urls: {
    frontend: string | null;
    backend: string | null;
    fullstack: string | null;
  } | null;
}

// Type pour l'insertion (les champs requis sont non-nullables)
export type ProjectInsertData = {
  title: string;
  description: string;
  technologies: string[];
  demo_url?: string | null;
  category: ProjectCategory | null;
  featured: boolean;
  date: string | null;
  github_urls?: GithubUrls | null;
};

// Type pour la mise à jour (tous les champs sont optionnels)
export type ProjectUpdateData = Partial<ProjectInsertData & { image_path?: string }>;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly supabase: SupabaseClient = inject(SupabaseClient);

  async getProjects(): Promise<ProjectData[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data || [];
  }

  async getProjectById(id: string): Promise<ProjectData | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
    return data;
  }

  async addProject(projectData: ProjectInsertData, imageFile: File): Promise<ProjectData | null> {
    const imagePath = `public/${Date.now()}_${imageFile.name}`;
    const { error: uploadError } = await this.supabase.storage
      .from('projects')
      .upload(imagePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const dataToInsert = {
      title: projectData.title,
      description: projectData.description,
      technologies: projectData.technologies,
      image_path: imagePath,
      demo_url: projectData.demo_url,
      github_urls: projectData.github_urls,
      category: projectData.category,
      featured: projectData.featured,
      date: projectData.date,
    };

    const { data, error: insertError } = await this.supabase
      .from('projects')
      .insert(dataToInsert)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting project:', insertError);
      throw insertError;
    }
    return data;
  }

  async updateProject(id: string, projectData: ProjectUpdateData, imageFile?: File): Promise<ProjectData | null> {
    let finalImagePath: string | undefined = projectData.image_path;

    if (imageFile) {
      const newImagePath = `public/${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await this.supabase.storage
        .from('projects')
        .upload(newImagePath, imageFile);

      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        throw uploadError;
      }
      finalImagePath = newImagePath;
    }

    const dataToUpdate = {
      title: projectData.title,
      description: projectData.description,
      technologies: projectData.technologies,
      image_path: finalImagePath,
      demo_url: projectData.demo_url,
      github_urls: projectData.github_urls,
      category: projectData.category,
      featured: projectData.featured,
      date: projectData.date,
    };

    const { data, error } = await this.supabase
      .from('projects')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
    return data;
  }

  async deleteProject(id: string, imagePath: string): Promise<void> {
    const { error: storageError } = await this.supabase.storage
      .from('projects')
      .remove([imagePath]);

    if (storageError) {
      console.error(`Error deleting image ${imagePath}:`, storageError);
    }

    const { error: dbError } = await this.supabase.from('projects').delete().eq('id', id);

    if (dbError) {
      console.error(`Error deleting project ${id}:`, dbError);
      throw dbError;
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.supabase.storage.from('projects').getPublicUrl(path);
    return data?.publicUrl || '';
  }
}


