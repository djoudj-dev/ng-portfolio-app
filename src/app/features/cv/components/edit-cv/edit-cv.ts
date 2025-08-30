import { ChangeDetectionStrategy, Component, inject, signal, computed, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { AuthService } from "@core/services/auth-service";
import { CvService } from "@features/cv/services/cv-service";
import { ButtonComponent } from "@shared/ui/button/button";
import { ToastService } from "@shared/ui/toast/service/toast-service";

@Component({
  selector: "app-edit-cv",
  imports: [CommonModule, ButtonComponent],
  templateUrl: "./edit-cv.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCvComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly cvService = inject(CvService);
  private readonly toastService = inject(ToastService);
  selectedFile: File | null = null;
  readonly dragActive = signal(false);
  readonly previewUrl = signal<string | null>(null);
  private readonly sanitizer = inject(DomSanitizer);
  readonly sanitizedPreviewUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.previewUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  readonly uploadStatus = signal<'idle' | 'uploading' | 'success' | 'error'>('idle');

  private setSelectedFile(file: File | null): void {
    const prev = this.previewUrl();
    if (prev) {
      URL.revokeObjectURL(prev);
    }
    this.selectedFile = file;
    if (file) {
      if (file.type !== 'application/pdf') {
        this.toastService.show({ message: 'Seuls les fichiers PDF sont autorisés.', type: 'error' });
        this.selectedFile = null;
        this.previewUrl.set(null);
        return;
      }
      const url = URL.createObjectURL(file);
      this.previewUrl.set(url);
    } else {
      this.previewUrl.set(null);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setSelectedFile(input.files[0]);
    } else {
      this.setSelectedFile(null);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragActive.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.setSelectedFile(files[0]);
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

    this.uploadStatus.set('uploading');

    try {
      const token = this.authService.getAccessToken();
      if (!token) {
        this.uploadStatus.set('error');
        this.toastService.show({ message: "Token d'accès manquant. Veuillez vous reconnecter.", type: 'error' });
        return;
      }

      const resp = await this.cvService.editUserCv({ file: this.selectedFile, token, userId: user.id });
      const path = resp?.path;

      if (path) {
        this.uploadStatus.set('success');
        this.toastService.show({
          message: "CV uploadé avec succès !",
          type: "success",
        });

        await this.cvService.refreshMeta();
        this.setSelectedFile(null);
      } else {
        this.uploadStatus.set('error');
        this.toastService.show({
          message: "Échec de l'upload du CV.",
          type: "error",
        });
      }
    } catch {
      this.uploadStatus.set('error');
      this.toastService.show({
        message: "Erreur lors de l'upload du CV.",
        type: "error",
      });
    }
  }

  ngOnDestroy(): void {
    const prev = this.previewUrl();
    if (prev) {
      URL.revokeObjectURL(prev);
    }
  }
}
