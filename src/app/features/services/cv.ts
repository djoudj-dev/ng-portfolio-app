import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { CvMetadata, UploadCvResponse } from '@core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/cv';

  async uploadCv(file: File, userId?: string): Promise<UploadCvResponse> {
    const formData = new FormData();
    formData.append('cv', file);

    if (userId) {
      formData.append('userId', userId);
    }

    try {
      return await firstValueFrom(
        this.http.put<UploadCvResponse>(`${this.baseUrl}/edit`, formData, {
          withCredentials: true // Utilise les cookies pour l'authentification
        })
      );
    } catch (error: unknown) {
      console.error('Erreur upload CV:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async getCurrentCvMetadata(userId?: string): Promise<CvMetadata> {
    try {
      const url = userId ? `${this.baseUrl}/meta/${userId}` : `${this.baseUrl}/meta`;
      return await firstValueFrom(
        this.http.get<CvMetadata>(url, {
          withCredentials: true
        })
      );
    } catch (error: unknown) {
      console.error('Erreur récupération métadonnées CV:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  async downloadCv(userId?: string): Promise<Blob> {
    try {
      const url = userId ? `${this.baseUrl}/download/${userId}` : `${this.baseUrl}/download`;
      return await firstValueFrom(
        this.http.get(url, {
          responseType: 'blob',
          withCredentials: true
        })
      );
    } catch (error: unknown) {
      console.error('Erreur téléchargement CV:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  getDownloadUrl(userId?: string): string {
    return userId ? `${this.baseUrl}/download/${userId}` : `${this.baseUrl}/download`;
  }

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
      return error.error.message as string;
    }

    if (error && typeof error === 'object' && 'status' in error) {
      const httpError = error as { status: number; message?: string };

      if (httpError.status === 401) {
        return 'Non autorisé. Veuillez vous reconnecter.';
      }

      if (httpError.status === 403) {
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      }

      if (httpError.status === 404) {
        return 'CV non trouvé.';
      }

      if (httpError.status === 400) {
        return 'Fichier invalide. Veuillez vérifier le format et la taille.';
      }

      if (httpError.status === 413) {
        return 'Fichier trop volumineux. Maximum 10 MB autorisé.';
      }

      if (httpError.status === 0) {
        return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      }

      return `Erreur ${httpError.status ?? 'inconnue'}: ${httpError.message ?? 'Une erreur s\'est produite'}`;
    }

    return 'Une erreur s\'est produite';
  }
}
