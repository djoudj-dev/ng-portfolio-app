import { Injectable, inject, signal, computed } from "@angular/core";
import { SupabaseService } from "@core/services/supabase-service";

export interface CvData {
  id: string;
  user_id: string;
  file_path: string;
  version: string;
  file_size: number;
  upload_date: string;
  download_count: number;
  last_updated: string;
}

export interface CvStats {
  version: string;
  uploadDate: string;
  fileSize: string;
  downloadCount: number;
  lastUpdated: string;
  hasCV: boolean;
}

@Injectable({
  providedIn: "root",
})
export class CvService {
  private readonly supabaseService = inject(SupabaseService);

  private readonly cvDataSignal = signal<CvData | null>(null);
  private readonly loadingSignal = signal<boolean>(false);

  readonly cvData = this.cvDataSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly cvStats = computed<CvStats>(() => {
    const data = this.cvDataSignal();

    if (!data) {
      return {
        version: "Aucun CV",
        uploadDate: "N/A",
        fileSize: "0 KB",
        downloadCount: 0,
        lastUpdated: "N/A",
        hasCV: false,
      };
    }

    return {
      version: data.version || "v1.0",
      uploadDate: this.formatDate(data.upload_date),
      fileSize: this.formatFileSize(data.file_size),
      downloadCount: data.download_count || 0,
      lastUpdated: this.formatDate(data.last_updated),
      hasCV: true,
    };
  });

  async loadCvData(): Promise<void> {
    const user = this.supabaseService.user();
    if (!user) return;

    this.loadingSignal.set(true);

    try {
      // Essayer directement la table cv_path (structure existante)
      const { data: pathData, error: pathError } =
        await this.supabaseService.client
          .from("cv_path")
          .select("*")
          .eq("user_id", user.id)
          .single();

      if (!pathError && pathData) {
        // Récupérer la taille du fichier depuis le storage
        let fileSize = 0;
        try {
          const { data: fileInfo } = await this.supabaseService.client.storage
            .from('docs')
            .list(user.id, {
              limit: 100,
              search: pathData.file_path.split('/').pop() // nom du fichier
            });
          
          if (fileInfo && fileInfo.length > 0) {
            const file = fileInfo.find(f => pathData.file_path.includes(f.name));
            if (file?.metadata?.['size']) {
              fileSize = Number(file.metadata['size']);
            }
          }
        } catch (error) {
          console.warn('Unable to get file size:', error);
        }

        // Créer un objet CvData à partir des données cv_path
        const cvData: CvData = {
          id: pathData.id ?? "legacy",
          user_id: pathData.user_id,
          file_path: pathData.file_path,
          version: "v1.0", // Version par défaut pour les CV existants
          file_size: fileSize, // Taille récupérée depuis le storage
          upload_date: pathData.created_at ?? new Date().toISOString(),
          download_count: pathData.download_count ?? 0, // Compteur depuis la base de données
          last_updated:
            pathData.updated_at ??
            pathData.created_at ??
            new Date().toISOString(),
        };
        this.cvDataSignal.set(cvData);
        return;
      }

      // Si pas de CV dans cv_path, essayer cv_data (future structure)
      const { data, error } = await this.supabaseService.client
        .from("cv_data")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        this.cvDataSignal.set(data as CvData);
        return;
      }

      // Aucun CV trouvé
      console.warn("No CV found in either cv_path or cv_data");
      this.cvDataSignal.set(null);
    } catch (error) {
      console.error("Error loading CV data:", error);
      this.cvDataSignal.set(null);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateCvStats(filePath: string, fileSize: number): Promise<void> {
    const user = this.supabaseService.user();
    if (!user) return;

    const now = new Date().toISOString();
    const cvData: Partial<CvData> = {
      user_id: user.id,
      file_path: filePath,
      file_size: fileSize,
      upload_date: now,
      last_updated: now,
      download_count: 0,
      version: this.generateVersion(),
    };

    try {
      const { data, error } = await this.supabaseService.client
        .from("cv_data")
        .upsert(cvData, { onConflict: "user_id" })
        .select()
        .single();

      if (!error && data) {
        this.cvDataSignal.set(data as CvData);
      }
    } catch (error) {
      console.error("Error updating CV stats:", error);
    }
  }

  async incrementDownloadCount(): Promise<void> {
    const data = this.cvDataSignal();
    if (!data) return;

    try {
      const newCount = (data.download_count || 0) + 1;
      
      // Mettre à jour la base de données
      const { data: updatedPath, error } = await this.supabaseService.client
        .from("cv_path")
        .update({ 
          download_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", data.user_id)
        .select()
        .single();
      
      if (!error && updatedPath) {
        // Mettre à jour le signal local
        const updatedData: CvData = {
          ...data,
          download_count: updatedPath.download_count ?? newCount,
          last_updated: updatedPath.updated_at ?? new Date().toISOString(),
        };
        
        this.cvDataSignal.set(updatedData);
        console.log(`CV download count incremented to: ${updatedData.download_count}`);
      } else {
        console.error("Error updating download count:", error);
      }
    } catch (error) {
      console.error("Error incrementing download count:", error);
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  }

  private formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return "0 KB";

    const sizes = ["bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  private generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `v${year}.${month}`;
  }
}
