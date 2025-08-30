import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { firstValueFrom } from "rxjs";

export interface CvData {
  id: string;
  userId: string;
  fileName: string;
  originalName?: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: string | null;
  downloadCount: number;
  createdAt: string;
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
  private readonly http = inject(HttpClient);
  private readonly cvDataSignal = signal<CvData | null>(null);
  private readonly loadingSignal = signal<boolean>(false);

  // Helpers
  private buildUploadFormData(file: File, userId?: string): FormData {
    const formData = new FormData();
    formData.append('cv', file, file.name);
    if (userId) formData.append('userId', userId);
    return formData;
  }

  private async safeReadError(res: Response): Promise<string> {
    try {
      const data = await res.json();
      const msg = (data as { message?: unknown }).message;
      return typeof msg === 'string' ? msg : JSON.stringify(data);
    } catch {
      return res.statusText || 'Unknown error';
    }
  }

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
      version: data.version ?? "v1.0",
      uploadDate: this.formatDate(data.createdAt),
      fileSize: this.formatFileSize(data.fileSize),
      downloadCount: data.downloadCount ?? 0,
      lastUpdated: this.formatDate(data.createdAt),
      hasCV: true,
    };
  });

  async loadCvData(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      // Charger les meta publiques du CV (portfolio)
      const meta = await firstValueFrom(this.http.get<CvData | null>(`${environment.apiUrl}/cv/meta`));
      this.cvDataSignal.set(meta ?? null);
    } catch {
      this.cvDataSignal.set(null);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async refreshMeta(): Promise<void> {
    await this.loadCvData();
  }

  async incrementDownloadCount(): Promise<void> {
    try {
      await firstValueFrom(this.http.get(`${environment.apiUrl}/cv/meta`));
    } catch {
      // ignore
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

  async downloadCV(): Promise<string | null> {
    try {
      return `${environment.apiUrl}/cv/download`;
    } catch {
      return null;
    }
  }

  async editUserCv(params: { file: File; token: string; userId?: string }): Promise<{ path: string }> {
    const formData = this.buildUploadFormData(params.file, params.userId);
    const res = await fetch(`${environment.apiUrl}/cv/edit`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${params.token}` },
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) {
      const message = await this.safeReadError(res);
      throw new Error(`Edit failed (${res.status}): ${message}`);
    }
    return (await res.json()) as { path: string };
  }
}
