import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SupabaseStorageService } from "@app/core/services/supabase-storage-service";
import { AuthService } from "@app/core/services/auth-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-edit-cv",
  imports: [CommonModule, ButtonComponent],
  templateUrl: "./edit-cv.html",
  styleUrl: "./edit-cv.css",
})
export class EditCvComponent {
  private readonly supabaseStorageService = inject(SupabaseStorageService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly uploadStatus = this.supabaseStorageService.uploadStatus;
  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  async uploadCv(): Promise<void> {
    if (!this.selectedFile) {
      this.toastService.show({
        message: "Veuillez sélectionner un fichier.",
        type: "error",
      });
      return;
    }

    const user = this.authService.user();
    if (!user) {
      this.toastService.show({
        message: "Vous devez être connecté pour uploader un CV.",
        type: "error",
      });
      return;
    }

    const path = await this.supabaseStorageService.uploadCV(
      this.selectedFile,
      user.id,
    );

    if (path) {
      this.toastService.show({
        message: "CV uploadé avec succès !",
        type: "success",
      });
      this.selectedFile = null;
    } else {
      this.toastService.show({
        message: "Échec de l'upload du CV.",
        type: "error",
      });
    }
  }

  async downloadCv(): Promise<void> {
    const user = this.authService.user();
    if (!user) {
      this.toastService.show({
        message:
          "Impossible de déterminer l'utilisateur pour le téléchargement du CV.",
        type: "error",
      });
      return;
    }

    const publicUrl = await this.supabaseStorageService.downloadCV(user.id);

    if (publicUrl) {
      window.open(publicUrl, "_blank");
      this.toastService.show({
        message: "Téléchargement du CV avec succès.",
        type: "success",
      });
    } else {
      this.toastService.show({
        message: "Échec du téléchargement du CV.",
        type: "error",
      });
    }
  }
}
